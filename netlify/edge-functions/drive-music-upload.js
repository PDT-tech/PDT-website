/* ============================================================
   PDT SINGERS — Music Library Write Proxy
   Netlify Edge Function (Deno)

   Handles music library write operations for role-gated admins.
   Allowed roles: musical_director, tech.

   Endpoint:
     POST /api/music-upload  (multipart/form-data)
       field: action = "create_folder" | "upload_file" | "delete_file"
       + action-specific fields (see below)

   create_folder: parentFolderId, folderName
   upload_file:   parentFolderId, file (binary), filename
   delete_file:   fileId

   Place at: netlify/edge-functions/drive-music-upload.js
   ============================================================ */

const TOKEN_URL       = 'https://oauth2.googleapis.com/token'
const DRIVE_BASE      = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type'
}

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

// ── Drive helpers ────────────────────────────────────────────

async function driveFileExists (folderId, name, token) {
  const q   = `'${folderId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`
  const url = `${DRIVE_BASE}?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`)
  const data = await res.json()
  return (data.files || []).length > 0
}

async function findAvailableName (folderId, filename, token) {
  const dotIdx = filename.lastIndexOf('.')
  const base   = dotIdx >= 0 ? filename.slice(0, dotIdx) : filename
  const ext    = dotIdx >= 0 ? filename.slice(dotIdx) : ''

  if (!(await driveFileExists(folderId, filename, token))) return filename

  for (let i = 1; i <= 99; i++) {
    const candidate = `${base}-${i}${ext}`
    if (!(await driveFileExists(folderId, candidate, token))) return candidate
  }

  return null  // all suffixes taken
}

// ── Response helper ──────────────────────────────────────────

function jsonRes (body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  })
}

// ── Handler ──────────────────────────────────────────────────

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  const user = await getSessionUser(request)
  if (!user) return jsonRes({ success: false, error: 'Unauthorized' }, 401)

  const role = await getUserRole(user.id)
  if (role !== 'musical_director' && role !== 'tech') {
    return jsonRes({ success: false, error: 'Forbidden' }, 403)
  }

  let form
  try {
    form = await request.formData()
  } catch {
    return jsonRes({ success: false, error: 'Invalid multipart body' }, 400)
  }

  const action = String(form.get('action') || '').trim()

  const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
  if (!saJson) return jsonRes({ success: false, error: 'Service account not configured' }, 500)

  let serviceAccount
  try {
    serviceAccount = JSON.parse(saJson)
  } catch {
    return jsonRes({ success: false, error: 'Invalid service account JSON' }, 500)
  }

  let token
  try {
    token = await getAccessToken(serviceAccount)
  } catch (err) {
    console.error('drive-music-upload: token error:', err)
    return jsonRes({ success: false, error: 'Drive API error.' }, 500)
  }

  try {
    // ── create_folder ──────────────────────────────────────
    if (action === 'create_folder') {
      const parentFolderId = String(form.get('parentFolderId') || '').trim()
      const folderName     = String(form.get('folderName') || '').trim()

      if (!parentFolderId || !folderName) {
        return jsonRes({ success: false, error: 'parentFolderId and folderName required' }, 400)
      }

      const res = await fetch(DRIVE_BASE, {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name    : folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents : [parentFolderId]
        })
      })

      if (!res.ok) {
        console.error('drive-music-upload: create_folder failed:', res.status, await res.text())
        return jsonRes({ success: false, error: 'Drive API error.' }, 500)
      }

      const data = await res.json()
      return jsonRes({ success: true, folderId: data.id, name: data.name })
    }

    // ── upload_file ────────────────────────────────────────
    if (action === 'upload_file') {
      const parentFolderId = String(form.get('parentFolderId') || '').trim()
      const fileField      = form.get('file')
      const filename       = String(form.get('filename') || '').trim()

      if (!parentFolderId || !fileField || typeof fileField === 'string' || !filename) {
        return jsonRes({ success: false, error: 'parentFolderId, file, and filename required' }, 400)
      }

      const mimeType = (fileField.type || '').toLowerCase()
      if (mimeType !== 'application/pdf' && mimeType !== 'audio/mpeg') {
        return jsonRes({
          success: false,
          error  : 'Only PDF and MP3 files are supported. Please select a supported file type and try again.'
        }, 415)
      }

      const finalName = await findAvailableName(parentFolderId, filename, token)
      if (!finalName) {
        return jsonRes({ success: false, error: 'Too many files with that name.' }, 409)
      }

      const fileBytes = new Uint8Array(await fileField.arrayBuffer())
      const boundary  = `pdtboundary${Date.now()}`
      const meta      = JSON.stringify({ name: finalName, parents: [parentFolderId] })
      const enc       = new TextEncoder()

      const preamble = enc.encode(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`
      )
      const epilogue = enc.encode(`\r\n--${boundary}--`)

      const driveBody = new Uint8Array(preamble.length + fileBytes.length + epilogue.length)
      driveBody.set(preamble)
      driveBody.set(fileBytes, preamble.length)
      driveBody.set(epilogue, preamble.length + fileBytes.length)

      const uploadRes = await fetch(DRIVE_UPLOAD_URL, {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: driveBody
      })

      if (!uploadRes.ok) {
        console.error('drive-music-upload: upload_file failed:', uploadRes.status, await uploadRes.text())
        return jsonRes({ success: false, error: 'Drive API error.' }, 500)
      }

      const uploadData = await uploadRes.json()
      return jsonRes({ success: true, fileId: uploadData.id, name: finalName })
    }

    // ── delete_file ────────────────────────────────────────
    if (action === 'delete_file') {
      const fileId = String(form.get('fileId') || '').trim()
      if (!fileId) return jsonRes({ success: false, error: 'fileId required' }, 400)

      const delRes = await fetch(`${DRIVE_BASE}/${encodeURIComponent(fileId)}`, {
        method : 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!delRes.ok && delRes.status !== 204) {
        console.error('drive-music-upload: delete_file failed:', delRes.status)
        return jsonRes({ success: false, error: 'Drive API error.' }, 500)
      }

      return jsonRes({ success: true })
    }

    return jsonRes({ success: false, error: 'Unknown action' }, 400)

  } catch (err) {
    console.error('drive-music-upload error:', err)
    return jsonRes({ success: false, error: 'Drive API error.' }, 500)
  }
}

export const config = { path: '/api/music-upload' }
