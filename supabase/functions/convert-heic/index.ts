// PDT Singers — HEIC → JPEG Conversion
// Triggered every 15 minutes via pg_cron. Processes up to 10 pending
// photo_uploads rows per invocation (HEIC → JPEG via jsquash WASM).
// Deploy: supabase functions deploy convert-heic

import { createClient }  from 'https://esm.sh/@supabase/supabase-js@2'
import decode             from 'https://esm.sh/@jsquash/heic@1.3.0'
import encode             from 'https://esm.sh/@jsquash/jpeg@1.5.0'

const TOKEN_URL    = 'https://oauth2.googleapis.com/token'
const DRIVE_BASE   = 'https://www.googleapis.com/drive/v3/files'
const RESEND_URL   = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'PDT Singers <noreply@pdtsingers.org>'
const TECH_EMAIL   = 'tech@pdtsingers.org'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Base64url helpers ────────────────────────────────────────

function base64urlStr (str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlBuf (buf: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Drive service account JWT / OAuth ───────────────────────

async function getDriveToken (): Promise<string> {
  const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
  if (!saJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set')
  const sa = JSON.parse(saJson)

  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '')

  let binary = ''
  for (const c of atob(pemBody)) binary += c
  const keyDer = Uint8Array.from(binary, (c: string) => c.charCodeAt(0))

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
    iss  : sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
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

// ── Drive helpers ────────────────────────────────────────────

async function fetchHeicBytes (fileId: string, token: string): Promise<ArrayBuffer> {
  const res = await fetch(`${DRIVE_BASE}/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Drive fetch failed: ${res.status}`)
  return res.arrayBuffer()
}

async function uploadJpeg (
  jpegBytes: ArrayBuffer,
  filename: string,
  folderId: string,
  token: string
): Promise<string> {
  const boundary = `convertboundary${Date.now()}`
  const meta     = JSON.stringify({ name: filename, parents: [folderId] })
  const enc      = new TextEncoder()

  const preamble = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
    `--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`
  )
  const epilogue = enc.encode(`\r\n--${boundary}--`)

  const body = new Uint8Array(preamble.length + jpegBytes.byteLength + epilogue.length)
  body.set(preamble)
  body.set(new Uint8Array(jpegBytes), preamble.length)
  body.set(epilogue, preamble.length + jpegBytes.byteLength)

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method : 'POST',
      headers: {
        Authorization : `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body
    }
  )
  if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`)
  const data = await res.json()
  if (!data.id) throw new Error('Drive upload returned no file ID')
  return data.id
}

async function deleteDriveFile (fileId: string, token: string): Promise<void> {
  const res = await fetch(`${DRIVE_BASE}/${encodeURIComponent(fileId)}`, {
    method : 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok && res.status !== 204) {
    console.warn(`convert-heic: HEIC delete failed (${res.status}) for ${fileId} — orphan in Drive`)
  }
}

// ── Error email ──────────────────────────────────────────────

async function sendErrorEmail (rowId: string, fileId: string, errorMsg: string): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) return
  await fetch(RESEND_URL, {
    method : 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      from   : FROM_ADDRESS,
      to     : [TECH_EMAIL],
      subject: 'PDT Photo HEIC conversion failed',
      text   : `Row id: ${rowId}\nDrive file id: ${fileId}\nError: ${errorMsg}`
    })
  })
}

// ── Handler ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const photosFolderId = Deno.env.get('GOOGLE_DRIVE_PHOTOS_FOLDER_ID')
  if (!photosFolderId) {
    return json({ error: 'GOOGLE_DRIVE_PHOTOS_FOLDER_ID not set' }, 500)
  }

  // Fetch pending rows (up to 10 per invocation to stay within timeout)
  const { data: rows, error: fetchErr } = await supabase
    .from('photo_uploads')
    .select('*')
    .eq('conversion_status', 'pending')
    .order('uploaded_at', { ascending: true })
    .limit(10)

  if (fetchErr) return json({ error: fetchErr.message }, 500)
  if (!rows || rows.length === 0) return json({ processed: 0, failed: 0 })

  let processed = 0
  let failed    = 0

  for (const row of rows) {
    // Mark as processing (optimistic lock — prevents double-processing)
    await supabase
      .from('photo_uploads')
      .update({ conversion_status: 'processing' })
      .eq('id', row.id)

    try {
      const token = await getDriveToken()

      // Fetch HEIC bytes from Drive
      const heicBytes = await fetchHeicBytes(row.drive_file_id, token)

      // Decode HEIC → ImageData, encode → JPEG at max quality
      const imageData = await decode(heicBytes)
      const jpegBytes = await encode(imageData, { quality: 100 })

      // Build new filename (.jpg extension)
      const jpegFilename = row.drive_filename.replace(/\.heic$/i, '.jpg')

      // Upload JPEG to the same Photos folder
      const newFileId = await uploadJpeg(jpegBytes, jpegFilename, photosFolderId, token)

      // Delete original HEIC (best-effort — JPEG is confirmed; failure is non-fatal)
      await deleteDriveFile(row.drive_file_id, token)

      // Update row with JPEG file id and mark done
      await supabase
        .from('photo_uploads')
        .update({
          drive_file_id    : newFileId,
          drive_filename   : jpegFilename,
          conversion_status: 'done',
          conversion_error : null
        })
        .eq('id', row.id)

      processed++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`convert-heic: failed for row ${row.id}:`, msg)
      await supabase
        .from('photo_uploads')
        .update({ conversion_status: 'failed', conversion_error: msg })
        .eq('id', row.id)
      await sendErrorEmail(row.id, row.drive_file_id, msg)
      failed++
    }
  }

  return json({ processed, failed })
})

function json (body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  })
}
