# PDT Singers — Photo Upload & Gallery Feature

**Status:** Planning  
**Created:** 2026-04-17 (Session 7)  
**Next step:** Architecture decisions and UX design before implementation

---

## The Idea

Members upload event photos from phone or desktop. Photos are stored in Google Drive
with metadata (uploader, event, caption, timestamp) in Supabase. A gallery viewer
lets members browse photos. Some photos may be exposed to the Friends of PDT audience.

---

## Proposed Architecture

**Upload flow:**
- Member-gated page (`members/photos.html`) — auth-guarded
- Upload form: image file picker, event selector (dropdown from `events` table),
  optional caption
- On submit: POST to new Netlify Function (`netlify/functions/upload-photo.js`)
- Netlify Function uploads file to Google Drive via service account JWT auth
  (same pattern as `drive-music.js`)
- Metadata written to new Supabase table after successful Drive upload

**Storage:**
- Files: Google Drive `.PDT/Photos/` — organized by event subfolder or flat with
  metadata-based filtering; TBD
- Metadata: new Supabase table (schema below)

**Retrieval:**
- Gallery page fetches metadata from Supabase, then loads thumbnails via Drive
  proxy (same Netlify Function pattern as music library, or a new
  `netlify/functions/photo-proxy.js`)

---

## Proposed Supabase Schema

```sql
CREATE TABLE photo_uploads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id  uuid REFERENCES profiles(id),
  event_id     uuid REFERENCES events(id),
  drive_file_id text NOT NULL,
  filename     text NOT NULL,
  caption      text,
  uploaded_at  timestamptz DEFAULT now()
);
```

RLS: all authenticated members can SELECT; insert restricted to own uploads;
delete restricted to uploader or admin.

---

## Open UX Questions

### 1. Upload and gallery: together or separate?

**Option A — Combined page**
Single `members/photos.html` with upload form at top, gallery below.
- Pro: one destination for everything photo-related
- Con: page gets long; upload UI competes with gallery for attention

**Option B — Separate pages**
`members/photos.html` = gallery viewer
`members/upload-photo.html` = upload form (linked from gallery)
- Pro: clean separation of concerns; gallery is the primary experience
- Con: one more nav item or buried link

**Option C — Upload is a modal on the gallery page**
Gallery is the page; "+ Upload Photos" button opens a modal form.
- Pro: cleanest UX; gallery-first; upload is a secondary action
- Con: slightly more JS complexity

Recommendation: **Option C** — modal upload on gallery page. Consistent with
how we handle New Event on the calendar. Familiar pattern for the codebase.

### 2. Gallery layout

Options:
- **Masonry grid** — Pinterest-style, variable height. Visually rich but
  complex to implement in vanilla JS without a library.
- **Fixed-aspect grid** — uniform thumbnails, CSS grid. Simple, clean,
  works well for mixed portrait/landscape.
- **Event-grouped list** — photos grouped by event with a header for each.
  More navigable; easier to find "photos from the April sing-out."

Recommendation: **Event-grouped** with fixed-aspect thumbnails. Navigable
for older users; no library dependency; fits our stack.

### 3. Lightbox / full-size view

Click a thumbnail → full-size view. Options:
- Simple: open Drive file URL in new tab
- Better: overlay lightbox with prev/next navigation, caption display
- Vanilla JS lightbox is ~50 lines; worth doing properly

### 4. Friends of PDT exposure

Some photos should be visible to non-members (Friends of PDT page or a
public `/photos` page). Questions:
- Who decides which photos are public? Uploader at upload time? Admin
  curation after the fact? Both?
- Suggest: add `is_public boolean DEFAULT false` to `photo_uploads` table.
  Admin can flip to true. Public gallery only shows `is_public = true`.
- Public photos served via same proxy pattern — no Drive link exposure.

### 5. Drive organization

Options:
- Flat folder (`.PDT/Photos/`) — all files in one place, metadata in Supabase
- Event subfolders (`.PDT/Photos/2026-04-06-Monday-Rehearsal/`) — browsable
  in Drive without Supabase, but harder to manage programmatically

Recommendation: **Flat folder** — Supabase is the source of truth for
organization. Drive is just blob storage.

### 6. File size / format handling

- Accept: JPEG, PNG, HEIC (iPhone default), WebP
- HEIC is a problem — browsers can't display it natively. Options:
  - Reject HEIC at upload, prompt user to convert
  - Convert server-side in Netlify Function (requires sharp or similar —
    adds npm dependency to function)
  - Accept and store as-is; display fallback thumbnail for unsupported formats
- Recommendation: reject HEIC at upload with a friendly message. iPhone
  users can set Camera → Format → Most Compatible to shoot JPEG.
- Max file size: Netlify Functions have a 6MB request body limit on free tier.
  Enforce client-side with a clear error message.

### 7. Nav placement

Where does "Photos" live in the member nav?
- Add as 8th item: Home / Director's Notes / Poohbah's Prattlings / Events /
  Comms / Calendar / Music / **Photos**
- Nav is getting long — worth a look at whether Comms and Resources could
  consolidate, or whether Photos belongs under a future "Community" section
- For now: add Photos to end of nav, revisit nav structure separately

---

## Implementation Order (suggested)

1. Create Drive `.PDT/Photos/` folder, share with service account
2. Add `photo_uploads` table + RLS to Supabase
3. Build `netlify/functions/upload-photo.js` — accepts multipart POST,
   uploads to Drive, returns Drive file ID
4. Build `members/photos.html` — gallery view + upload modal
5. Add `is_public` flag + admin toggle UI
6. Build public-facing gallery (Friends page or `/photos.html`) — Phase 2

---

## Questions Still Needing Answers

- [ ] Do we want a lightbox or open-in-new-tab for full-size?
- [ ] Who curates public photos — uploader self-selects, admin approves, or both?
- [ ] HEIC: reject at upload or convert server-side?
- [ ] Nav: add Photos as 8th item or restructure nav first?
- [ ] Should the public gallery be its own page or a section of Friends of PDT?
- [ ] Do we want download capability for members (e.g. "Download all photos
  from this event")?
- [ ] Storage cost check: Google Drive Workspace for Nonprofits quota is 
  generous but confirm before assuming unlimited.
