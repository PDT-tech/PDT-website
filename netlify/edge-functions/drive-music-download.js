/* ============================================================
   PDT SINGERS — Google Drive Music Download Proxy
   Netlify Edge Function (Deno)

   Terminal handler — does NOT call context.next().
   Validates the Supabase session, obtains a service account
   Drive token, then streams the file directly to the browser.
   No file content is buffered in this function, so there is
   no response-size ceiling.

   Endpoint:
     GET /api/music-download?fileId=FILE_ID&filename=NAME
       → streams file content with correct Content-Disposition

   Place at: netlify/edge-functions/drive-music-download.js
   ============================================================ */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

// ── Base64url helpers ────────────────────────────────────────

function base64urlStr (str) {
  // UTF-8 string → base64url
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlBuf (buf) {
  // ArrayBuffer → base64url (loop avoids stack-overflow on spread for large buffers)
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Service account JWT / OAuth ──────────────────────────────

async function getAccessToken (serviceAccount) {
  // Strip PEM header/footer lines and all whitespace, then decode to DER bytes
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
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud  : TOKEN_URL,
    iat  : now,
    exp  : now + 3600
  }))

  const unsigned  = `${header}.${claim}`
  const sigBuf    = await crypto.subtle.sign(
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

  const authed = await validateSession(request)
  if (!authed) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const params   = new URL(request.url).searchParams
  const fileId   = params.get('fileId')
  const filename = params.get('filename') || 'download'

  if (!fileId) {
    return new Response(JSON.stringify({ error: 'fileId required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
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

  try {
    const token    = await getAccessToken(serviceAccount)
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!driveRes.ok) {
      return new Response(
        JSON.stringify({ error: `Drive returned ${driveRes.status}` }),
        { status: driveRes.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const contentType = driveRes.headers.get('content-type') || 'application/octet-stream'
    const isPdf       = filename.toLowerCase().endsWith('.pdf')
    const safeName    = filename.replace(/"/g, '')
    const disposition = isPdf ? `inline; filename="${safeName}"` : `attachment; filename="${safeName}"`

    // Stream driveRes.body directly — no buffering, no size ceiling
    return new Response(driveRes.body, {
      status: 200,
      headers: {
        'Content-Type'       : contentType,
        'Content-Disposition': disposition,
        'Cache-Control'      : 'private, max-age=3600',
      }
    })

  } catch (err) {
    console.error('drive-music-download error:', err)
    return new Response(
      JSON.stringify({ error: 'Drive API error', detail: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const config = { path: '/api/music-download' }
