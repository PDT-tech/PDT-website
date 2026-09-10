#!/usr/bin/env node
/**
 * trim-christmas-folders.js
 *
 * One-time cleanup: in each of the four Christmas voice-part folders
 * (Bari, Bass, Lead, Tenor), delete every file EXCEPT items whose
 * filename matches one of the titles on the KEEP_TITLES list below.
 *
 * Matching is done by normalizing filenames and checking whether they
 * contain one of the keep-list song titles as a substring. This means
 * both full-mix tracks and voice-part tracks are kept automatically —
 * nothing in the matching logic looks at "mix" vs. "part."
 *
 * SAFE BY DEFAULT: running with no flags only prints what WOULD be
 * deleted. Nothing is removed from Drive until you pass --live.
 *
 * Folder IDs:
 *   The four Christmas voice-part folder IDs are read from environment
 *   variables (never hardcoded — the repo is public):
 *     GOOGLE_DRIVE_XMAS_BARI_FOLDER_ID
 *     GOOGLE_DRIVE_XMAS_BASS_FOLDER_ID
 *     GOOGLE_DRIVE_XMAS_TENOR_FOLDER_ID
 *     GOOGLE_DRIVE_XMAS_LEAD_FOLDER_ID
 *   These load automatically from a .env file in the repo root (gitignored),
 *   or you may export them in your shell instead.
 *
 * Usage (run from the repo root):
 *   node scripts/trim-christmas-folders.js              # dry run (default)
 *   node scripts/trim-christmas-folders.js --live       # actually deletes
 *
 * Requires:
 *   npm install googleapis   (one-time, if not already a dependency)
 *
 * Auth:
 *   Uses the existing service account key file
 *   (pdt-singers-music-library-*.json, gitignored, repo root) with
 *   domain-wide delegation impersonating tech@pdtsingers.org — the same
 *   pattern already used by drive-music-upload.js for Drive writes.
 *   Override the key file path with GOOGLE_APPLICATION_CREDENTIALS if
 *   it's not in the repo root.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Load folder IDs (and any other vars) from a .env file in the repo root if
// present. Node >= 20.12 provides process.loadEnvFile; harmless when .env is
// absent (e.g. the vars are exported in the shell instead).
try {
  if (typeof process.loadEnvFile === 'function') process.loadEnvFile();
} catch { /* no .env file — rely on already-set process.env */ }

// ---- Configuration -------------------------------------------------

const KEEP_TITLES = [
  'Silent Night',
  'It Came Upon the Midnight Clear',
  'O Holy Night',
  'Jingle Bells',
  "Children's Medley",
  'We Wish You a Merry Christmas',
  'Yuletide Favorites Volume 1',
];

const FOLDERS = [
  { label: 'Bari',  id: process.env.GOOGLE_DRIVE_XMAS_BARI_FOLDER_ID },
  { label: 'Bass',  id: process.env.GOOGLE_DRIVE_XMAS_BASS_FOLDER_ID },
  { label: 'Tenor', id: process.env.GOOGLE_DRIVE_XMAS_TENOR_FOLDER_ID },
  { label: 'Lead',  id: process.env.GOOGLE_DRIVE_XMAS_LEAD_FOLDER_ID },
];

const IMPERSONATE_USER = 'tech@pdtsingers.org';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// ---- Helpers ---------------------------------------------------------

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const NORMALIZED_KEEP_TITLES = KEEP_TITLES.map(normalize);

function shouldKeep(filename) {
  const n = normalize(filename);
  return NORMALIZED_KEEP_TITLES.some((title) => n.includes(title));
}

function findServiceAccountKeyFile() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  const repoRoot = process.cwd();
  const candidates = fs
    .readdirSync(repoRoot)
    .filter((f) => f.startsWith('pdt-singers-music-library-') && f.endsWith('.json'));
  if (candidates.length === 0) {
    throw new Error(
      'Could not find the service account key file (pdt-singers-music-library-*.json) ' +
        'in the current directory, and GOOGLE_APPLICATION_CREDENTIALS is not set. ' +
        'Run this script from the repo root, or set GOOGLE_APPLICATION_CREDENTIALS ' +
        'to the key file path.'
    );
  }
  return path.join(repoRoot, candidates[0]);
}

async function getDriveClient() {
  const keyFile = findServiceAccountKeyFile();
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));

  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: SCOPES,
    subject: IMPERSONATE_USER, // domain-wide delegation, same as drive-music-upload.js
  });

  return google.drive({ version: 'v3', auth });
}

async function listAllFiles(drive, folderId) {
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name)',
      pageSize: 200,
      pageToken,
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

// ---- Main ------------------------------------------------------------

async function main() {
  const isLive = process.argv.includes('--live');

  const missing = FOLDERS.filter((f) => !f.id).map((f) => f.label);
  if (missing.length) {
    throw new Error(
      `Missing folder ID env var(s) for: ${missing.join(', ')}. ` +
        'Set GOOGLE_DRIVE_XMAS_{BARI,BASS,TENOR,LEAD}_FOLDER_ID in .env ' +
        '(repo root, gitignored) or export them in your shell.'
    );
  }

  console.log(isLive ? '=== LIVE RUN — files will be deleted ===' : '=== DRY RUN — no files will be deleted ===');
  console.log('Keeping tracks matching:', KEEP_TITLES.join(', '));
  console.log('');

  const drive = await getDriveClient();

  let totalKept = 0;
  let totalDeleted = 0;

  for (const folder of FOLDERS) {
    console.log(`--- ${folder.label} (${folder.id}) ---`);
    const files = await listAllFiles(drive, folder.id);

    const toKeep = [];
    const toDelete = [];

    for (const file of files) {
      if (shouldKeep(file.name)) {
        toKeep.push(file);
      } else {
        toDelete.push(file);
      }
    }

    console.log(`  Keeping (${toKeep.length}):`);
    toKeep.forEach((f) => console.log(`    KEEP   ${f.name}`));

    console.log(`  ${isLive ? 'Deleting' : 'Would delete'} (${toDelete.length}):`);
    for (const f of toDelete) {
      console.log(`    ${isLive ? 'DELETE' : 'WOULD DELETE'} ${f.name}`);
      if (isLive) {
        await drive.files.delete({ fileId: f.id });
      }
    }

    totalKept += toKeep.length;
    totalDeleted += toDelete.length;
    console.log('');
  }

  console.log('=== Summary ===');
  console.log(`Kept:    ${totalKept}`);
  console.log(`${isLive ? 'Deleted' : 'Would delete'}: ${totalDeleted}`);
  if (!isLive) {
    console.log('');
    console.log('This was a dry run. Review the "WOULD DELETE" list above carefully —');
    console.log('especially checking for any file that should have been kept but wasn\'t');
    console.log('matched (inconsistent naming). Re-run with --live to actually delete.');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
