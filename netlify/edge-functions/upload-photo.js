/* ============================================================
   PDT SINGERS — Photo Upload Proxy
   Netlify Edge Function (Deno)

   Validates session, extracts EXIF datetime from JPEG, uploads
   file to Google Drive, inserts metadata row in Supabase.

   Endpoint:
     POST /api/upload-photo  (multipart/form-data)
       fields: file, event_id, original_filename

   Place at: netlify/edge-functions/upload-photo.js
   ============================================================ */

const TOKEN_URL       = 'https://oauth2.googleapis.com/token'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'

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

// ── EXIF datetime extraction (JPEG only) ─────────────────────
//
// Scans JPEG APP1 segment for EXIF IFD0 → ExifIFD.
// Returns 'YYYYMMDD-HHmmss' or null if EXIF absent or unparseable.

function extractExifDateTime (bytes) {
  try {
    let i = 2  // skip SOI marker FF D8
    while (i + 4 < bytes.length) {
      if (bytes[i] !== 0xFF) break
      const marker = bytes[i + 1]
      const segLen = (bytes[i + 2] << 8) | bytes[i + 3]  // includes the 2 length bytes

      if (marker === 0xDA) break  // start of scan data — stop searching

      if (marker === 0xE1 && i + 9 < bytes.length) {
        // APP1 — check for Exif\0\0 header (bytes: 45 78 69 66 00 00)
        if (bytes[i+4] === 0x45 && bytes[i+5] === 0x78 && bytes[i+6] === 0x69 &&
            bytes[i+7] === 0x66 && bytes[i+8] === 0x00 && bytes[i+9] === 0x00) {

          const tBase = i + 10  // TIFF header start
          const le    = bytes[tBase] === 0x49  // 'I' = little-endian, 'M' = big-endian

          const r16 = o => le
            ? bytes[tBase+o] | (bytes[tBase+o+1] << 8)
            : (bytes[tBase+o] << 8) | bytes[tBase+o+1]

          const r32 = o => le
            ? bytes[tBase+o] | (bytes[tBase+o+1] << 8) |
              (bytes[tBase+o+2] << 16) | (bytes[tBase+o+3] << 24)
            : (bytes[tBase+o] << 24) | (bytes[tBase+o+1] << 16) |
              (bytes[tBase+o+2] << 8) | bytes[tBase+o+3]

          // Read ASCII string from TIFF-relative offset (DateTime is always >4 bytes → stored at offset)
          const readStr = offset => {
            let s = ''
            for (let c = 0; c < 19 && tBase + offset + c < bytes.length; c++) {
              const code = bytes[tBase + offset + c]
              if (!code) break
              s += String.fromCharCode(code)
            }
            return s
          }

          // Scan one IFD; returns { dateTime, dateTimeOriginal, exifPtr }
          const scanIFD = ifdOff => {
            const count = r16(ifdOff)
            const result = { dateTime: null, dateTimeOriginal: null, exifPtr: null }
            for (let e = 0; e < count; e++) {
              const off = ifdOff + 2 + e * 12
              if (off + 12 > bytes.length - tBase) break
              const tag = r16(off)
              if (tag === 0x0132) result.dateTime         = readStr(r32(off + 8))
              else if (tag === 0x9003) result.dateTimeOriginal = readStr(r32(off + 8))
              else if (tag === 0x8769) result.exifPtr          = r32(off + 8)
            }
            return result
          }

          // IFD0 has DateTime (0x0132) and ExifIFD pointer (0x8769)
          // ExifIFD has DateTimeOriginal (0x9003) — preferred over DateTime
          const ifd0 = scanIFD(r32(4))
          let raw = null
          if (ifd0.exifPtr) raw = scanIFD(ifd0.exifPtr).dateTimeOriginal
          if (!raw) raw = ifd0.dateTime

          if (raw && /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) {
            return raw.replace(
              /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
              '$1$2$3-$4$5$6'
            )
          }
        }
      }

      i += 2 + segLen
    }
  } catch {}
  return null
}

// ── Upload datetime fallback ─────────────────────────────────

function nowStamp () {
  const d = new Date()
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
    '-',
    String(d.getUTCHours()).padStart(2, '0'),
    String(d.getUTCMinutes()).padStart(2, '0'),
    String(d.getUTCSeconds()).padStart(2, '0')
  ].join('')
}

// ── Handler ──────────────────────────────────────────────────

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Validate session and extract user id
  const user = await validateSession(request)
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Parse multipart form
  let form
  try {
    form = await request.formData()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid multipart body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const fileField        = form.get('file')
  const originalFilename = String(form.get('original_filename') || '').trim()
  const eventIdRaw       = String(form.get('event_id') || '').trim()
  const eventId          = eventIdRaw || null

  if (!fileField || typeof fileField === 'string') {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Validate content type: jpeg or heic only
  const contentType = (fileField.type || '').toLowerCase()
  if (contentType !== 'image/jpeg' && contentType !== 'image/heic') {
    return new Response(JSON.stringify({ error: 'Please upload JPEG or HEIC photos only.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const isHeic = contentType === 'image/heic'

  // Read file bytes
  const fileBytes = new Uint8Array(await fileField.arrayBuffer())

  // Extract EXIF datetime (JPEG only; HEIC falls back immediately)
  let stamp = null
  if (!isHeic) stamp = extractExifDateTime(fileBytes)
  if (!stamp) stamp = nowStamp()

  const filename         = `${stamp}-${originalFilename}`
  const conversionStatus = isHeic ? 'pending' : 'done'

  // Load service account
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

  const photosFolderId = Deno.env.get('GOOGLE_DRIVE_PHOTOS_FOLDER_ID')
  if (!photosFolderId) {
    return new Response(JSON.stringify({ error: 'Photos folder not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let token
  try {
    token = await getAccessToken(serviceAccount)
  } catch (err) {
    console.error('upload-photo: token error:', err)
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Build multipart/related body for Drive upload
  const boundary = `pdtboundary${Date.now()}`
  const meta     = JSON.stringify({ name: filename, parents: [photosFolderId] })
  const enc      = new TextEncoder()

  const preamble = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
    `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`
  )
  const epilogue = enc.encode(`\r\n--${boundary}--`)

  const driveBody = new Uint8Array(preamble.length + fileBytes.length + epilogue.length)
  driveBody.set(preamble)
  driveBody.set(fileBytes, preamble.length)
  driveBody.set(epilogue, preamble.length + fileBytes.length)

  // Upload to Drive
  const driveRes = await fetch(DRIVE_UPLOAD_URL, {
    method : 'POST',
    headers: {
      Authorization : `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: driveBody
  })

  if (!driveRes.ok) {
    console.error('upload-photo: Drive upload failed:', driveRes.status, await driveRes.text())
    return new Response(JSON.stringify({ error: 'Drive upload failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const driveData  = await driveRes.json()
  const driveFileId = driveData.id

  if (!driveFileId) {
    return new Response(JSON.stringify({ error: 'Drive returned no file ID' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Insert metadata row in Supabase using service role key (bypasses RLS;
  // uploader_id is set explicitly from the validated session token above)
  const supabaseUrl      = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/photo_uploads`, {
    method : 'POST',
    headers: {
      apikey        : serviceRoleKey,
      Authorization : `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer        : 'return=minimal'
    },
    body: JSON.stringify({
      drive_file_id    : driveFileId,
      drive_filename   : filename,
      uploader_id      : user.id,
      event_id         : eventId,
      conversion_status: conversionStatus
    })
  })

  if (!insertRes.ok) {
    console.error('upload-photo: Supabase insert failed:', insertRes.status, await insertRes.text())
    return new Response(JSON.stringify({ error: 'Metadata insert failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ drive_file_id: driveFileId, drive_filename: filename }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const config = { path: '/api/upload-photo' }
