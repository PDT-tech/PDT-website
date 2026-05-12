/* ============================================================
   PDT SINGERS — Photo Proxy
   Netlify Edge Function (Deno)

   Streams Drive photos to browser. Two modes:
     ?fileId=<id>&filename=<name>&auth=1  → auth-gated (member gallery)
     ?fileId=<id>&filename=<name>         → public (carousel, Friends page)

   Place at: netlify/edge-functions/photo-proxy.js
   ============================================================ */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

// ── Base64url helpers ────────────────────────────────────────

function base64urlStr (str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlBuf (buf) {
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Service account JWT / OAuth ──────────────────────────────

async function getAccessToken (serviceAccount) {
  const pemBody = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '')

  let binary = ''
  for (const c of atob(pemBody)) binary += c
  const keyDer = Uint8Array.from(binary, c => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const now    = Math.floor(Date.now() / 1000)
  const header = base64urlStr(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim  = base64urlStr(JSON.stringify({
    iss  : serviceAccount.client_email,
    sub  : 'tech@pdtsingers.org',
    scope: 'https://www.googleapis.com/auth/drive',
    aud  : TOKEN_URL,
    iat  : now,
    exp  : now + 3600
  }))

  const unsigned = `${header}.${claim}`
  const sigBuf   = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  )
  const jwt = `${unsigned}.${base64urlBuf(sigBuf)}`

  const res = await fetch(TOKEN_URL, {
    method : 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion : jwt
    })
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  return (await res.json()).access_token
}

// ── Supabase session validation ──────────────────────────────

async function validateSession (request) {
  const supabaseUrl  = Deno.env.get('SUPABASE_URL')
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnon) return false

  const auth  = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return false

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnon }
  })
  return res.ok
}

// ── Handler ──────────────────────────────────────────────────

export default async (request) => {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const params    = new URL(request.url).searchParams
  const fileId    = params.get('fileId')
  const filename  = params.get('filename') || ''
  const needsAuth = params.get('auth') === '1'

  if (!fileId) {
    return new Response(JSON.stringify({ error: 'fileId required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (needsAuth) {
    const authed = await validateSession(request)
    if (!authed) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
  if (!saJson) {
    return new Response(JSON.stringify({ error: 'Service account not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(saJson)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid service account JSON' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let token
  try {
    token = await getAccessToken(serviceAccount)
  } catch (err) {
    console.error('photo-proxy: token error:', err)
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!driveRes.ok) {
    return new Response(
      JSON.stringify({ error: `Drive returned ${driveRes.status}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const ext = (filename.split('.').pop() || '').toLowerCase()
  const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
    : ext === 'heic' ? 'image/heic'
    : 'application/octet-stream'

  const cacheControl = needsAuth ? 'private, max-age=3600' : 'public, max-age=3600'

  return new Response(driveRes.body, {
    status: 200,
    headers: {
      'Content-Type'       : contentType,
      'Content-Disposition': 'inline',
      'Cache-Control'      : cacheControl
    }
  })
}

export const config = { path: '/api/photo' }
