#!/usr/bin/env node
/**
 * reorg-christmas-folders.js
 *
 * One-time migration: the Christmas repertoire currently lives in four
 * voice-part folders (Bari, Bass, Tenor, Lead), each holding that part's tracks
 * (and some PDFs) for every Christmas song. This script regroups the files into
 * one folder PER SONG, named "Xmas - <song name>", each containing that song's
 * PDF and all part tracks. New song folders are created as siblings of the four
 * voice-part folders (same Drive parent). Files are MOVED and RENAMED to a
 * standard scheme, so the voice-part folders end up empty (except any flagged
 * conflicts) and ready to delete by hand.
 *
 * Standardized names (canonical title, punctuation dropped):
 *   <Song> - Tenor.mp3   <Song> - Lead.mp3   <Song> - Bari.mp3   <Song> - Bass.mp3
 *   <Song> - Mix.mp3     <Song>.pdf
 *   <Song> - <Part> (Sing Along).mp3   (for the TTBB sing-along tracks)
 *
 * De-dupe: the "Full Mix" track and PDFs are duplicated across the four folders.
 * Files that map to the same standardized name are collapsed to one copy — but
 * ONLY when they are byte-identical (same Drive md5Checksum). The extras are
 * sent to Trash (recoverable). If same-named files DIFFER, they are flagged as a
 * CONFLICT and left in place (nothing moved/renamed/trashed) for manual review.
 *
 * SAFE BY DEFAULT: with no flags it only prints the plan. Nothing is created,
 * renamed, moved, or trashed until you pass --live.
 *
 * Usage (from repo root):
 *   node scripts/reorg-christmas-folders.js           # dry run (default)
 *   node scripts/reorg-christmas-folders.js --live    # execute
 *
 * Folder IDs from .env (repo root, gitignored):
 *   GOOGLE_DRIVE_XMAS_{BARI,BASS,TENOR,LEAD}_FOLDER_ID
 * Auth: service account key (pdt-singers-music-library-*.json) with domain-wide
 * delegation impersonating tech@pdtsingers.org — same as trim-christmas-folders.js.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

try {
  if (typeof process.loadEnvFile === 'function') process.loadEnvFile();
} catch { /* no .env — rely on already-set process.env */ }

// ---- Configuration -------------------------------------------------

// Canonical song titles → "Xmas - <title>" folders. Longer titles first so
// substring matching prefers the most specific.
const SONG_TITLES = [
  'It Came Upon the Midnight Clear',
  'We Wish You a Merry Christmas',
  'Yuletide Favorites Volume 1',
  "Children's Medley",
  'Remembering Decembers',
  'Mary Had A Baby',
  'Silent Night',
  'O Holy Night',
  'Jingle Bells',
];

const FOLDER_PREFIX = 'Xmas - ';

// Per-song overrides for non-TTBB (SATB) charts, where one men's part is sung by
// two PDT sections. The combined label is embedded in the filename so the
// my-tracks.html voice-part matcher (substring on tenor/lead/bari/bass) serves
// the right track to every section. e.g. "Remembering Decembers" is SATB sung
// with the ladies: Baris+Basses sing the Bass part, Tenors+Leads the Tenor part.
const PART_LABEL_OVERRIDES = {
  'Remembering Decembers': { Bass: 'Bass & Bari', Tenor: 'Tenor & Lead' },
};

const FOLDERS = [
  { label: 'Bari',  id: process.env.GOOGLE_DRIVE_XMAS_BARI_FOLDER_ID },
  { label: 'Bass',  id: process.env.GOOGLE_DRIVE_XMAS_BASS_FOLDER_ID },
  { label: 'Tenor', id: process.env.GOOGLE_DRIVE_XMAS_TENOR_FOLDER_ID },
  { label: 'Lead',  id: process.env.GOOGLE_DRIVE_XMAS_LEAD_FOLDER_ID },
];

const IMPERSONATE_USER = 'tech@pdtsingers.org';
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER_MIME = 'application/vnd.google-apps.folder';

// Part detection (checked in order). Titles here contain no part words, so we
// scan the whole filename.
const PART_PATTERNS = [
  { part: 'Bari',  re: /baritone|\bbari\b/ },
  { part: 'Bass',  re: /\bbass\b/ },
  { part: 'Lead',  re: /\blead\b/ },
  { part: 'Tenor', re: /\btenor\b/ },
];

// ---- Helpers ---------------------------------------------------------

function normalize(s) {
  return s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const NORMALIZED_TITLES = SONG_TITLES.map((t) => ({ title: t, norm: normalize(t) }));

function matchTitle(filename) {
  const n = normalize(filename);
  const hits = NORMALIZED_TITLES.filter((t) => n.includes(t.norm));
  if (hits.length === 1) return { title: hits[0].title };
  if (hits.length === 0) return { unmatched: true };
  // Prefer the longest normalized title if one contains another; else ambiguous.
  hits.sort((a, b) => b.norm.length - a.norm.length);
  if (hits[0].norm.includes(hits[1].norm) || hits[1].norm.includes(hits[0].norm)) {
    return { title: hits[0].title };
  }
  return { ambiguous: hits.map((h) => h.title) };
}

// Given a filename and its canonical song title, return the standardized name +
// kind. kind ∈ 'pdf' | 'mix' | 'part' | 'singalong' | 'unknown'
function classify(filename, title) {
  if (/\.pdf$/i.test(filename)) return { kind: 'pdf', std: `${title}.pdf` };
  const lower = filename.toLowerCase();

  // Preserve special practice tracks as-is — DO NOT force them into the part
  // scheme (a "No Bass" track contains "bass" and would be mislabeled). Covers
  // "slow" tempo tracks and "part missing" / "no <part>" / "without" tracks.
  const isSlow = /\bslow\b/.test(lower);
  const isMissing = /\bno\s+(tenor|lead|bari|baritone|bass)\b/.test(lower)
    || /(tenor|lead|bari|baritone|bass)\s+(missing|out)\b/.test(lower)
    || /\bmissing\b/.test(lower)
    || /\bwithout\b/.test(lower);
  if (isSlow || isMissing) {
    return { kind: 'special', std: filename };  // keep original filename verbatim
  }

  const singAlong = /sing\s*along/.test(lower);
  let part = null;
  for (const p of PART_PATTERNS) { if (p.re.test(lower)) { part = p.part; break; } }
  if (part) {
    const label = (PART_LABEL_OVERRIDES[title] && PART_LABEL_OVERRIDES[title][part]) || part;
    return {
      kind: singAlong ? 'singalong' : 'part',
      std: `${title} - ${label}${singAlong ? ' (Sing Along)' : ''}.mp3`,
    };
  }
  if (/\bmix\b/.test(lower)) return { kind: 'mix', std: `${title} - Mix.mp3` };
  return { kind: 'unknown', std: null };
}

function findServiceAccountKeyFile() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidates = fs.readdirSync(process.cwd())
    .filter((f) => f.startsWith('pdt-singers-music-library-') && f.endsWith('.json'));
  if (!candidates.length) throw new Error('Service account key file not found in repo root and GOOGLE_APPLICATION_CREDENTIALS unset.');
  return path.join(process.cwd(), candidates[0]);
}

async function getDriveClient() {
  const key = JSON.parse(fs.readFileSync(findServiceAccountKeyFile(), 'utf8'));
  const auth = new google.auth.JWT({ email: key.client_email, key: key.private_key, scopes: SCOPES, subject: IMPERSONATE_USER });
  return google.drive({ version: 'v3', auth });
}

async function listAllFiles(drive, folderId) {
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, md5Checksum, size)',
      pageSize: 200,
      pageToken,
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

async function getParent(drive, folderId) {
  const res = await drive.files.get({ fileId: folderId, fields: 'id, name, parents' });
  return { name: res.data.name, parent: (res.data.parents || [])[0] };
}

async function listChildFolders(drive, parentId) {
  const map = new Map();
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${parentId}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`,
      fields: 'nextPageToken, files(id, name)',
      pageSize: 200,
      pageToken,
    });
    for (const f of res.data.files || []) map.set(f.name, f.id);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return map;
}

// ---- Main ------------------------------------------------------------

async function main() {
  const isLive = process.argv.includes('--live');
  const missing = FOLDERS.filter((f) => !f.id).map((f) => f.label);
  if (missing.length) throw new Error(`Missing folder ID env var(s) for: ${missing.join(', ')}.`);

  console.log(isLive ? '=== LIVE RUN — creating folders, moving/renaming files, trashing duplicates ===' : '=== DRY RUN — no changes will be made ===');
  console.log('');

  const drive = await getDriveClient();

  const parents = new Set();
  for (const f of FOLDERS) {
    const info = await getParent(drive, f.id);
    if (info.parent) parents.add(info.parent);
    console.log(`  ${f.label}: "${info.name}" → parent ${info.parent}`);
  }
  if (parents.size !== 1) throw new Error(`Voice-part folders do not share one parent (found ${parents.size}). Aborting.`);
  const parentId = [...parents][0];
  console.log(`\nNew "Xmas - <song>" folders go in parent: ${parentId}\n`);

  const existingFolders = await listChildFolders(drive, parentId);
  const sourceIdByLabel = new Map(FOLDERS.map((f) => [f.label, f.id]));

  // Collect every file, tagged with its song + standardized name.
  const bySong = new Map();   // title -> [{ id, name, from, std, kind, md5 }]
  const unmatched = [], ambiguous = [], unknown = [], nested = [];

  for (const folder of FOLDERS) {
    for (const file of await listAllFiles(drive, folder.id)) {
      if (file.mimeType === FOLDER_MIME) { nested.push({ ...file, from: folder.label }); continue; }
      const m = matchTitle(file.name);
      if (m.ambiguous) { ambiguous.push({ name: file.name, from: folder.label, titles: m.ambiguous }); continue; }
      if (m.unmatched) { unmatched.push({ name: file.name, from: folder.label }); continue; }
      const c = classify(file.name, m.title);
      if (c.kind === 'unknown') { unknown.push({ name: file.name, from: folder.label, title: m.title }); continue; }
      if (!bySong.has(m.title)) bySong.set(m.title, []);
      bySong.get(m.title).push({ id: file.id, name: file.name, from: folder.label, std: c.std, kind: c.kind, md5: file.md5Checksum });
    }
  }

  // Build actions per song: moves (unique std), dedupes (identical extras), conflicts (differing).
  const actions = []; // { type:'create'|'move'|'trash', ... }
  const conflicts = [];
  let moveCount = 0, trashCount = 0;

  for (const title of SONG_TITLES) {
    const files = bySong.get(title) || [];
    const folderName = FOLDER_PREFIX + title;
    console.log(`--- ${folderName}  ${existingFolders.has(folderName) ? '(exists)' : '(create)'} ---`);
    if (!files.length) { console.log('    (no files matched)\n'); continue; }

    // Group by standardized name.
    const groups = new Map();
    for (const f of files) { if (!groups.has(f.std)) groups.set(f.std, []); groups.get(f.std).push(f); }

    for (const [std, group] of [...groups.entries()].sort()) {
      if (group.length === 1) {
        const f = group[0];
        const tag = f.kind === 'special' ? '   (special — name preserved)' : '';
        console.log(`    MOVE   [${f.from}] ${f.name}   ->   ${std}${tag}`);
        actions.push({ type: 'move', file: f, std, title, folderName });
        moveCount++;
      } else {
        const md5s = new Set(group.map((g) => g.md5 || `nomd5:${g.id}`));
        if (md5s.size === 1) {
          const [keep, ...extra] = group;
          console.log(`    MOVE   [${keep.from}] ${keep.name}   ->   ${std}   (identical x${group.length}, keeping 1)`);
          actions.push({ type: 'move', file: keep, std, title, folderName });
          moveCount++;
          for (const e of extra) {
            console.log(`    TRASH  [${e.from}] ${e.name}   (duplicate of above)`);
            actions.push({ type: 'trash', file: e });
            trashCount++;
          }
        } else {
          console.log(`    ⚠ CONFLICT for "${std}" — files DIFFER, LEFT IN PLACE:`);
          group.forEach((g) => console.log(`        [${g.from}] ${g.name}  (md5 ${g.md5 || 'n/a'})`));
          conflicts.push({ std, group });
        }
      }
    }
    console.log('');
  }

  if (ambiguous.length) { console.log('=== AMBIGUOUS (match >1 title — LEFT IN PLACE) ==='); ambiguous.forEach((f) => console.log(`    [${f.from}] ${f.name} → ${f.titles.join(', ')}`)); console.log(''); }
  if (unknown.length)   { console.log('=== UNKNOWN part/type (LEFT IN PLACE) ===');       unknown.forEach((f) => console.log(`    [${f.from}] ${f.name}`)); console.log(''); }
  if (unmatched.length) { console.log('=== UNMATCHED (no song title — LEFT IN PLACE) ==='); unmatched.forEach((f) => console.log(`    [${f.from}] ${f.name}`)); console.log(''); }
  if (nested.length)    { console.log('=== SUB-FOLDERS (LEFT IN PLACE) ===');             nested.forEach((f) => console.log(`    [${f.from}] ${f.name}`)); console.log(''); }

  console.log('=== Summary ===');
  console.log(`Files to move+rename: ${moveCount}`);
  console.log(`Duplicates to trash:  ${trashCount}`);
  console.log(`Conflicts left in place: ${conflicts.length}   Ambiguous: ${ambiguous.length}   Unknown: ${unknown.length}   Unmatched: ${unmatched.length}`);

  if (!isLive) {
    console.log('\nDRY RUN — review MOVE / TRASH / CONFLICT above. Re-run with --live to execute.');
    return;
  }

  // ---- LIVE ----
  console.log('\n=== Executing ===');
  const folderIdByName = new Map(existingFolders);
  async function ensureFolder(name) {
    if (folderIdByName.has(name)) return folderIdByName.get(name);
    const res = await drive.files.create({ requestBody: { name, mimeType: FOLDER_MIME, parents: [parentId] }, fields: 'id' });
    folderIdByName.set(name, res.data.id);
    console.log(`  created ${name}`);
    return res.data.id;
  }
  for (const a of actions) {
    if (a.type === 'move') {
      const targetId = await ensureFolder(a.folderName);
      await drive.files.update({ fileId: a.file.id, addParents: targetId, removeParents: sourceIdByLabel.get(a.file.from), requestBody: { name: a.std }, fields: 'id' });
    } else if (a.type === 'trash') {
      await drive.files.update({ fileId: a.file.id, requestBody: { trashed: true }, fields: 'id' });
    }
  }
  console.log(`\nDone. Moved+renamed ${moveCount}, trashed ${trashCount} duplicate(s).`);
  console.log('Conflicts (if any) were left in their voice-part folders for manual review;');
  console.log('once those are resolved, the four voice-part folders can be deleted by hand.');
}

main().catch((err) => { console.error('Error:', err.message); process.exit(1); });
