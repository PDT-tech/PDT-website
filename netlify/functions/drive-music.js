/* ============================================================
   PDT SINGERS — Google Drive Music Library Proxy
   Netlify Serverless Function

   Authenticates to Google Drive using a service account,
   then proxies file listing requests so no credentials are
   ever exposed to the browser.

   Endpoints:
     GET /.netlify/functions/drive-music?type=folders
       → lists all song folders in the Music folder
     GET /.netlify/functions/drive-music?type=files&folderId=FOLDER_ID
       → lists all files in a song folder

   Place at: netlify/functions/drive-music.js
   ============================================================ */

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3/files'
const TOKEN_URL  = 'https://oauth2.googleapis.com/token'

// ── JWT / OAuth helpers ──────────────────────────────────────

function base64url (str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function getAccessToken (serviceAccount) {
  const now    = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim  = base64url(JSON.stringify({
    iss  : serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud  : TOKEN_URL,
    iat  : now,
    exp  : now + 3600
  }))

  const unsigned = `${header}.${claim}`

  // Sign with RSA-SHA256 using the service account private key
  const crypto   = await import('crypto')
  const sign     = crypto.createSign('RSA-SHA256')
  sign.update(unsigned)
  const signature = base64url(sign.sign(serviceAccount.private_key))

  const jwt = `${unsigned}.${signature}`

  // Exchange JWT for access token
  const res = await fetch(TOKEN_URL, {
    method : 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion : jwt
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  const data = await res.json()
  return data.access_token
}

// ── Drive helpers ────────────────────────────────────────────

async function listFolders (token, musicFolderId) {
  const q   = `'${musicFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const url = `${DRIVE_BASE}?q=${encodeURIComponent(q)}&fields=files(id,name)&orderBy=name`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Drive folders fetch failed: ${res.status}`)
  const data = await res.json()
  return data.files || []
}

async function listFiles (token, folderId) {
  const q   = `'${folderId}' in parents and trashed=false`
  const url = `${DRIVE_BASE}?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&orderBy=name`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Drive files fetch failed: ${res.status}`)
  const data = await res.json()
  return data.files || []
}

// ── Handler ──────────────────────────────────────────────────

export const handler = async (event) => {
  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  // Parse service account from env
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!saJson) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Service account not configured' }) }
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(saJson)
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Invalid service account JSON' }) }
  }

  const musicFolderId = process.env.GOOGLE_DRIVE_MUSIC_FOLDER_ID
  if (!musicFolderId) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Music folder ID not configured' }) }
  }

  const params   = event.queryStringParameters || {}
  const type     = params.type
  const folderId = params.folderId

  if (!type || !['folders', 'files'].includes(type)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'type must be folders or files' }) }
  }

  if (type === 'files' && !folderId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'folderId required for files' }) }
  }

  try {
    const token = await getAccessToken(serviceAccount)

    let result
    if (type === 'folders') {
      result = await listFolders(token, musicFolderId)
    } else {
      result = await listFiles(token, folderId)
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type' : 'application/json',
        'Cache-Control': 'private, max-age=300' // 5 min cache — files don't change often
      },
      body: JSON.stringify(result)
    }

  } catch (err) {
    console.error('drive-music function error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Drive API error', detail: err.message })
    }
  }
}
