# PDT Singers — Photo Upload & Gallery Feature

**Status:** Design complete — ready for implementation planning  
**Created:** 2026-04-17 (Session 7)  
**Last updated:** 2026-04-26 (Session 8) — all architecture decisions resolved  
**Next step:** Write CC build prompts

---

## The Idea

Members upload event photos from phone or desktop. Photos are stored in Google Drive
with metadata (uploader, event, caption, timestamp) in Supabase. A gallery viewer
lets members browse and download photos by event. Some photos are curated for public
display on the home page and Friends page carousels.

---

## Resolved Architecture Decisions

### Storage

- **Files:** Google Workspace Drive (`/Photos/` folder, flat structure)
  - `/Photos/` — all member-uploaded photos
  - `/Photos/Mainpage_Carousel/` — curated subset for public carousel display
- **Metadata:** `photo_uploads` Supabase table (see schema below)
- **Source of truth for organization:** Supabase metadata, not Drive folder structure
- **Drive folder IDs:** stored as Netlify env vars (`GOOGLE_DRIVE_PHOTOS_FOLDER_ID`,
  `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID`) and injected via `inject-env.js`

### Infrastructure

- Same service account (`pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`)
  already shared on `/Photos/` and `/Photos/Mainpage_Carousel/`
- Same proxy pattern as Music Library — Netlify Edge Function streams directly,
  no buffering, no size ceiling (same fix as issue #016)
- Upload: new Netlify Edge Function (`netlify/edge-functions/upload-photo.js`)
  streams multipart POST directly to Drive via service account JWT auth
- Download/retrieval: new Netlify Edge Function (`netlify/edge-functions/photo-proxy.js`)
  streams Drive file content to browser

### Accepted Upload Formats

**JPEG and HEIC only.** All other formats (PNG, WebP, RAW, DNG, etc.) are rejected
at upload time with a clear error message: "Please upload JPEG or HEIC photos only."

Rationale: JPEG is the Android camera default and universal browser format. HEIC is
the iPhone camera default. These two formats cover >95% of real-world phone uploads.
PNG, WebP, and RAW are excluded to keep the upload pipeline simple and avoid
encouraging huge files.

### File Size

No enforced cap. RAW files are excluded by format filter; HEIC and JPEG from phone
cameras realistically max out at 8–12MB. Let the uploader manage their own
file sizes.

### Filename De-confliction

The upload function timestamps filenames using the photo's EXIF datetime (extracted
server-side using `exifr`), falling back to upload datetime if EXIF is absent.

Format: `YYYYMMDD-HHmmss-<originalname>.<ext>`

This ensures Drive filenames sort chronologically, enables admins to manually
disambiguate untagged photos later, and eliminates filename collisions across
multiple uploaders.

### HEIC Conversion (Post-Process)

HEIC files are stored as-is at upload time. A background job converts them to JPEG
at maximum quality (quality=100) after the upload completes. Conversion is invisible
to the uploader.

**Conversion queue:** `photo_uploads` table has a `conversion_status` column
(`pending` | `processing` | `done` | `failed`). HEIC uploads land with
`conversion_status = 'pending'`. Non-HEIC uploads land with `conversion_status = 'done'`
and skip conversion entirely.

**Trigger:** GCP Cloud Scheduler (free tier) calls the `convert-heic` Supabase Edge
Function via HTTP POST every 15 minutes. Cloud Scheduler is configured in the
existing GCP project (`pdt-singers-music-library`). The Edge Function URL is
`https://<project-ref>.supabase.co/functions/v1/convert-heic` with an `Authorization`
header carrying the service role key. No pg_cron, no Netlify scheduled function —
both require paid plan upgrades.

The function queries for `conversion_status = 'pending'` rows, processes
them in upload-time order, converts each HEIC to JPEG via `heic-to (npm:heic-to@1.4.2, WASM-based via Emscripten/libheif)`,
writes the JPEG to the same Drive folder, verifies the Drive file ID,
deletes the original HEIC, and updates the Supabase row with the new `drive_file_id`
and `conversion_status = 'done'`. If conversion fails, sets `conversion_status = 'failed'`
and records the error in `conversion_error` text column.

**Error reporting:** On failure, the Edge Function sends an email to `tech@pdtsingers.org`
via Resend. The admin curation UI surfaces rows with `conversion_status = 'failed'`
with the error text visible inline. Both immediate notification and persistent audit trail.

**HEIC deletion safety:** Write JPEG → verify Drive confirms the file ID → delete HEIC →
update row. If delete fails, the row already has the JPEG file ID so the app is never
broken; stale HEIC in Drive is cleaned up manually.

### Upload UX

- Auth-gated member page (`members/photos.html`)
- Upload triggered by "+ Upload Photos" button opening a modal (consistent with
  calendar New Event pattern)
- File picker: `accept="image/jpeg,image/heic"` — triggers native photo picker on mobile
- **Multi-select:** up to 8 photos per upload operation. Attempting more than 8
  shows a clear error before upload starts.
- **Progress:** "Uploading 3 of 8…" counter displayed during upload. Files uploaded
  sequentially; progress updates after each file completes.
- **Camera roll permission:** handled by browser/OS natively. If user denies
  permission, file picker returns empty — no special handling needed.
- **Event association:** uploader selects event from dropdown (see Event Tagging below)
- No per-photo captions in V1. Event association is the only metadata the uploader
  provides beyond the photos themselves.

### Event Tagging at Upload

- Dropdown populated from `events` table, filtered to events within the last 90 days
- Default selection: "General / No specific event" (top of list, pre-selected)
- Event selection is not required — uploading without changing the default is valid
- Photos with no event: `event_id = null` in Supabase; stored flat in `/Photos/`
- EXIF datetime in filename gives admins enough to manually sort untagged photos later

### Curation Model

- All uploads land with `is_public = false`
- Admin and events_editor roles see a "Make public" toggle per photo in the member
  gallery view (inline, role-gated — no separate curation page)
- Checking "Make public" triggers a Netlify Function call that:
  1. Copies the Drive file to `/Photos/Mainpage_Carousel/`
  2. Sets `is_public = true` in Supabase
- Unchecking reverses: deletes the copy from `Mainpage_Carousel/`, sets `is_public = false`
- Curation event dropdown: "All recent events with photos" (silently 90-day filtered)
  plus "All events with photos" option to expand beyond 90 days

### Home Page Carousel

- Source: `/Photos/Mainpage_Carousel/` Drive folder — all files in that folder
- Display order: randomized client-side on each page load
- Page load behavior: logo placeholder image displayed immediately; carousel begins
  swapping in Drive photos as they load. Initial render is never blocked on Drive.
- Lazy-load: preload next image while current is displayed
- Auto-advance with configurable interval (TBD at build time — suggest 5 seconds)
- Pause on hover; navigation arrows
- No download buttons on public carousel — right-click is sufficient

### Friends Page Carousel

- V1: replicate home page carousel exactly (same source folder, same behavior)
- No auth gating in V1
- Future: expand to event-grouped browsing and/or auth-gated Friend accounts based
  on observed engagement (post-V1 work item — see below)

### Member Gallery (`members/photos.html`)

- Gallery view: event-grouped, fixed-aspect thumbnails, CSS grid
- Event picker dropdown: recent events with photos (90-day default, expandable)
- Lightbox: click thumbnail → full-size overlay with prev/next navigation within
  the event group, caption display (event name + upload date), download button
  (single photo only in V1)
- Admin/events_editor: inline "Make public" toggle visible per photo

### Public Downloads

- Right-click only from carousel — no download buttons on public surfaces
- Members can download individual photos from the lightbox (download button)
- Batch "download all event photos" deferred to V2 if demand warrants

---

## Supabase Schema

```sql
CREATE TABLE photo_uploads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id       uuid REFERENCES profiles(id),
  event_id          uuid REFERENCES events(id) ON DELETE SET NULL,
  drive_file_id     text NOT NULL,
  filename          text NOT NULL,
  original_format   text NOT NULL,          -- 'jpeg' | 'heic'
  conversion_status text NOT NULL DEFAULT 'done',
                                            -- 'pending' | 'processing' | 'done' | 'failed'
  conversion_error  text,                   -- populated on failure
  is_public         boolean NOT NULL DEFAULT false,
  carousel_file_id  text,                   -- Drive file ID of copy in Mainpage_Carousel
  uploaded_at       timestamptz DEFAULT now()
);
```

**RLS:**
- SELECT: all authenticated members
- INSERT: own uploads only (uploader_id = auth.uid())
- UPDATE is_public / carousel_file_id: admin and events_editor only
- DELETE: uploader or admin

---

## New Environment Variables Required

| Variable | What it is |
|----------|-----------|
| `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` | ID of `/Photos/` folder in Workspace Drive |
| `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` | ID of `/Photos/Mainpage_Carousel/` subfolder |

Both go in Netlify env vars and `env.local.js`. Both injected via `inject-env.js`.

**Work item for Kevin:** Create `/Photos/Mainpage_Carousel/` subfolder in Drive,
confirm service account has write access (it's inherited from `/Photos/` share),
grab the folder ID, add both folder IDs to Netlify env vars and `env.local.js`.

---

## Implementation Order

1. **Kevin (manual):** Create `/Photos/Mainpage_Carousel/` in Drive, grab folder IDs,
   set `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` and `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` in
   Netlify env vars and `env.local.js`
2. **Schema:** Add `photo_uploads` table + RLS to Supabase
3. **Upload function:** `netlify/edge-functions/upload-photo.js` — multipart POST,
   EXIF extraction, Drive upload, Supabase row insert
4. **Photo proxy:** `netlify/edge-functions/photo-proxy.js` — streams Drive file
   to browser (auth-gated and public variants)
5. **Member gallery page:** `members/photos.html` — event picker, grid, upload modal,
   lightbox, admin curation toggle
6. **Carousel component:** home page and Friends page carousel (shared JS module)
7. **HEIC conversion:** `convert-heic` Supabase Edge Function + GCP Cloud Scheduler
8. **inject-env.js update:** add `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` and
   `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` to injected vars

---

## Post-V1 Work Items

- **Friend auth / broader gallery access:** If Friends engagement warrants it,
  add Supabase auth for Friends so they can browse event-grouped photos beyond
  the carousel. Decision deferred — collect engagement data first.
- **Batch download:** "Download all photos from this event" for members.
  Deferred — add if demand is clear.
- **Video upload:** Deliberately deferred. See maintainers guide §17 for
  the deferred-video rationale and open questions.
- **Friend photo uploads:** Any authenticated user (Supabase `authenticated` role)
  can upload — schema and RLS already support this. No UI work needed beyond
  adding Friend auth.

---

## Issues

- **#014** — Home page animated carousel (feeds from `/Photos/Mainpage_Carousel/`)
- **#015** — Full photo upload, gallery, curation, and carousel system (this doc)
- **#059** — Donation page with Stripe (future feature, no due date — see issues list)
