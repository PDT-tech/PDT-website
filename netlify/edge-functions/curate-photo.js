/* ============================================================
   PDT SINGERS — Photo Curation Endpoint
   Netlify Edge Function (Deno)

   Handles the "Make public" toggle in the member gallery.
   Copies or removes photos from the Mainpage_Carousel Drive folder
   and updates the is_public flag in Supabase.

   POST /api/curate-photo
   Body: { fileId: string, filename: string, makePublic: boolean }

   Auth: session required + role must be admin or events_editor.

   Place at: netlify/edge-functions/curate-photo.js
   ============================================================ */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DRIVE_BASE = 'https://www.googleapis.com/drive/v3/files'

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

// ── Supabase helpers ─────────────────────────────────────────

async function getSessionUser (request) {
  const supabaseUrl  = Deno.env.get('SUPABASE_URL')
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnon) return null

  const auth  = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnon }
  })
  if (!res.ok) return null
  const user = await res.json()
  return user?.id ? user : null
}

async function getUserRole (userId) {
  const supabaseUrl    = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const res = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role`,
    {
      headers: {
        apikey       : serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    }
  )
  if (!res.ok) return null
  const rows = await res.json()
  return rows?.[0]?.role || null
}

async function getPhotoRow (driveFileId) {
  const supabaseUrl    = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const res = await fetch(
    `${supabaseUrl}/rest/v1/photo_uploads?drive_file_id=eq.${encodeURIComponent(driveFileId)}&select=carousel_file_id&limit=1`,
    {
      headers: {
        apikey       : serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    }
  )
  if (!res.ok) return null
  const rows = await res.json()
  return rows?.[0] || null
}

async function updatePhotoRow (driveFileId, patch) {
  const supabaseUrl    = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const res = await fetch(
    `${supabaseUrl}/rest/v1/photo_uploads?drive_file_id=eq.${encodeURIComponent(driveFileId)}`,
    {
      method : 'PATCH',
      headers: {
        apikey        : serviceRoleKey,
        Authorization : `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer        : 'return=minimal'
      },
      body: JSON.stringify(patch)
    }
  )
  return res.ok
}

// ── Handler ──────────────────────────────────────────────────

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Auth: validate session
  const user = await getSessionUser(request)
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Auth: check role (admin or events_editor only)
  const role = await getUserRole(user.id)
  if (role !== 'admin' && role !== 'events_editor') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { fileId, filename, makePublic } = body
  if (!fileId || typeof makePublic !== 'boolean') {
    return new Response(JSON.stringify({ error: 'fileId and makePublic required' }), {
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

  const carouselFolderId = Deno.env.get('GOOGLE_DRIVE_CAROUSEL_FOLDER_ID')
  if (!carouselFolderId) {
    return new Response(JSON.stringify({ error: 'Carousel folder not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const token = await getAccessToken(serviceAccount)

    if (makePublic) {
      // Copy the Drive file to the Mainpage_Carousel folder
      const copyRes = await fetch(`${DRIVE_BASE}/${encodeURIComponent(fileId)}/copy`, {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parents: [carouselFolderId], name: filename })
      })

      if (!copyRes.ok) {
        console.error('curate-photo: Drive copy failed:', copyRes.status, await copyRes.text())
        return new Response(JSON.stringify({ error: 'Drive copy failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const copyData      = await copyRes.json()
      const carouselFileId = copyData.id

      if (!carouselFileId) {
        return new Response(JSON.stringify({ error: 'Drive copy returned no file ID' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Update Supabase row
      const ok = await updatePhotoRow(fileId, { is_public: true, carousel_file_id: carouselFileId })
      if (!ok) {
        return new Response(JSON.stringify({ error: 'Supabase update failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ carouselFileId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } else {
      // makePublic = false — remove from carousel folder
      const row = await getPhotoRow(fileId)

      if (row?.carousel_file_id) {
        // Delete the carousel copy from Drive (best-effort)
        const delRes = await fetch(
          `${DRIVE_BASE}/${encodeURIComponent(row.carousel_file_id)}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
        )
        if (!delRes.ok && delRes.status !== 204) {
          console.warn('curate-photo: carousel delete failed:', delRes.status, '— continuing')
        }
      }

      // Update Supabase row
      const ok = await updatePhotoRow(fileId, { is_public: false, carousel_file_id: null })
      if (!ok) {
        return new Response(JSON.stringify({ error: 'Supabase update failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (err) {
    console.error('curate-photo error:', err)
    return new Response(JSON.stringify({ error: 'Internal error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/curate-photo' }
