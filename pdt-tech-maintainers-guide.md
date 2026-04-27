# PDT Singers — Tech Maintainer's Guide

**Last updated:** 2026-04-27  
**Owner:** Kevin Bier (president@pdtsingers.org)  
**Site:** pdtsingers.org  
**Repo:** https://github.com/kevin36v/PDT-website

---

## 1. Overview

The PDT Singers website is a hand-coded HTML5/CSS3/vanilla JS site hosted on Netlify,
with Supabase handling authentication and member content storage. There is no build
step, no framework, no CMS. Updating the site means editing files and pushing to GitHub.

**Monthly cost:** ~$0 (domain renewal ~$12/yr is the only recurring expense)

---

## 2. Accounts & Access

| Service | URL | Login | What it controls |
|---------|-----|-------|-----------------|
| Netlify | netlify.com | GitHub (kevin36v) | Hosting, deploys, env vars, forms |
| Supabase | supabase.com | GitHub (kevin36v) | Auth, database, member accounts |
| GitHub | github.com/kevin36v | kevin36v | Source control, CI/CD |
| Google Cloud | console.cloud.google.com | president@pdtsingers.org | Music Library service account |
| Google Workspace | admin.google.com | president@pdtsingers.org | Email, Drive, Meet |
| Resend | resend.com | — | Transactional email (magic links) |
| Helping Hosting | — | — | Domain registrar (pdtsingers.org) |

⚠️ **CRITICAL: Kevin is currently the sole owner of every service listed above.**
If Kevin is unavailable for any reason, no one else can make changes to the site,
member accounts, DNS, or any other system. This is an unacceptable single point of
failure for a functioning chorus.

**Action required — add a second admin to every service:**
- [ ] Netlify — add second owner (Site settings → Team)
- [ ] Supabase — add second owner (Project settings → Team)
- [ ] GitHub — add second owner (repo Settings → Collaborators)
- [ ] Google Cloud Console — add second owner to pdt-singers-music-library project
- [ ] Google Workspace admin — add second admin (admin.google.com)
- [ ] Resend — add second owner (Team settings)
- [ ] Helping Hosting (domain registrar) — add second account or document recovery path
- [ ] Goodstack (formerly TechSoup) — add second contact

The backup admin should be a board member (Grant Gibson is the natural candidate as
Secretary-Treasurer) or a trusted technical contact. They do not need to know how to
use these systems day-to-day — they just need access so they can hand off to a future
maintainer if needed.

---

## 3. Local Development

```bash
cd ~/PDT-website
python3 -m http.server 8080
```

Open: http://localhost:8080

**Required:** `env.local.js` must be present in the repo root. This file is gitignored
and sets `window.__PDT_ENV` with Supabase and Google Drive credentials. Never commit it.

For Music Library local testing: temporarily set the Music folder in Google Drive to
"Anyone with link" (Viewer), test, then revert to Restricted. Don't forget to revert.

---

## 4. Deploy Workflow

Netlify auto-publishing is **locked** — pushes to GitHub do not auto-deploy.

**Standard deploy:**
1. Make changes locally, test at localhost:8080
2. Have CC commit and push to origin/main
3. Go to Netlify dashboard → Deploys → **Trigger deploy → Deploy site**
4. Wait for "Published" (usually under 30 seconds)
5. Verify live at pdtsingers.org
6. Auto-publishing stays locked — nothing further needed

**Do not unlock auto-publishing** unless you want every push to deploy immediately.
The manual deploy step is intentional — it prevents accidental deploys of
work-in-progress commits and conserves build credits.

**Netlify build credits:** The site is on the Personal plan ($9/month), which includes
1,000 build credits/month. Each production deploy costs approximately 15 credits (~65
deploys/month before hitting the ceiling). That's generous for normal maintenance but
easy to burn during active development if you deploy after every small change.
Mitigation: test all changes on localhost:8080 before deploying. Batch related changes
into a single deploy. During active feature work, one deploy per working session is a
reasonable target unless something is genuinely broken in production.

---

## 5. Environment Variables

Credentials are injected at runtime by the Netlify edge function `inject-env.js`.
Never hardcode credentials in committed files.

**Netlify environment variables** (set in Netlify → Site configuration → Environment variables):

| Variable | What it is |
|----------|-----------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `GOOGLE_DRIVE_API_KEY` | Drive API key (local dev only) |
| `GOOGLE_DRIVE_MUSIC_FOLDER_ID` | Music folder ID in Drive |
| `GOOGLE_DRIVE_SUNBURST_FOLDER_ID` | ID of the Sunburst newsletter folder in Drive |
| `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` | ID of `/Photos/` folder in Workspace Drive |
| `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` | ID of `/Photos/Mainpage_Carousel/` subfolder |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON (secret) |

**Supabase Edge Function secrets** (set in Supabase → Edge Functions → Manage secrets):

| Variable | What it is |
|----------|-----------|
| `RESEND_API_KEY` | Resend API key for transactional email from Edge Functions |
| `SITE_URL` | `https://pdtsingers.org` — used in email deep-links |

⚠️ **Important distinction:** Netlify env vars and Supabase Edge Function secrets are separate systems. Do not mix them up. Netlify vars are for production environment injection and Netlify Functions. Supabase secrets are for Edge Functions that send transactional email.

⚠️ **Finding Supabase API keys:** In the Supabase dashboard, go to Project Settings → API.
The page has two tabs. The keys used for this project (`SUPABASE_ANON_KEY` and the service
role key used in pg_cron jobs) are on the **Legacy** tab — not the default tab. The default
tab shows newer API key formats that are not what the site expects.

<!-- html-synced: 2026-04-18 — Supabase Legacy tab note added to §5 -->

To update: Netlify dashboard → Site configuration → Environment variables.
Changes take effect on next deploy.

---

## 6. Member Account Management

All accounts are admin-created. Members cannot self-register.

### Adding a new member

**Step 1 — Create the Supabase account**

1. Supabase dashboard → Authentication → Users
2. Click **Invite user**
3. Enter the member's email address and click **Send invitation**

Supabase sends an invitation email. The member uses it to set up access, then logs
in via the OTP flow (email → 6-digit code). No password required.

**Step 2 — Set role and profile fields**

After the account appears in Authentication → Users, open Table Editor → profiles
and find the new row (auto-created by trigger). Set:

| Field | Value |
|-------|-------|
| `role` | `member` (singers), `council_member` (High Council), `events_editor` (SMM/Events), `musical_director` (Chris), `calendar_manager` (events coordinator), `admin` (Kevin) |
| `voice_part` | `Tenor`, `Lead`, `Baritone`, `Bass`, or `null` for non-singers |
| `full_name` | Member's full name |
| `is_active` | `true` |

Or use the SQL editor:

```sql
UPDATE profiles
SET role = 'member',        -- adjust as needed
    full_name = 'First Last',
    is_active = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'member@example.com'
);
```

**Step 3 — Verify**

Log in as the member (or ask them to confirm) that they can reach `/members/`
and see the correct content for their role.

### Roles reference

| Role | Assigned to | Calendar | Poohbah's Prattlings | Director's Notes | Events Blog | Member content |
|------|-------------|----------|----------------------|------------------|-------------|----------------|
| `admin` | Kevin Bier | Full CRUD | Post (any author) | Post (any author) | Post (any author) | Full access |
| `council_member` | Grant Gibson + any HC member Kevin designates | Read only | Post own entries | — | — | Full access |
| `musical_director` | Chris Gabel | Read only | — | Post own entries | — | Full access |
| `calendar_manager` | Future social coordinator or non-member volunteer | Full CRUD | — | — | — | Full access |
| `events_editor` | Moss Egli (SMM) + Wives Auxiliary, etc. | Read only | — | — | Post own entries | Full access |
| `member` | All active PDT Singers | Read + mark absences | — | — | — | Full access |

**Notes:**
- "Post own entries" means the role can create, edit, and delete only posts they authored. Admin can edit or delete any post.
- `calendar_manager` can create, edit, and delete any calendar event. No blog posting rights.
- Non-singing roles (`calendar_manager`, `events_editor`) have `voice_part = null`.
- To assign a role, see Step 2 above.

### Deactivating a member

- Table Editor → profiles → set `is_active = false`
- Their login will be blocked. No need to delete the auth user.

---

## 7. Member Content (Blogs & Posts)

Blog posts are stored in the Supabase `posts` table. Members with appropriate roles
can post via the member portal UI. There is no external CMS.

**Blog → Role required to post:**
- Director's Notes → `musical_director` or `admin`
- Grand Poohbah's Prattlings → `council_member` or `admin`
- Events Blog → `events_editor` or `admin`
- The Sunburst → `admin` only (newsletter_editor role reserved for future use)

Non-admin authors can only edit and delete their own posts. Admins can edit and delete any post by any author.

Posts have a `published` boolean. Unpublished posts are only visible to the author
and admin. Published posts are visible to all authenticated members.

---

## 8. Chorus Calendar & Attendance

### Calendar

Rehearsal events are auto-generated by a Supabase Edge Function
(`generate-rehearsals`) that runs weekly and creates Monday rehearsal events
12 weeks out. Default: 10:30am–12:30pm at Westside Journey UMC.

**To cancel a rehearsal:** find the event in the calendar UI (admin view) and mark
it as Cancelled. It will show struck-through on the calendar.

**To change rehearsal location temporarily:** edit the individual event in the
calendar UI.

**To change the default location permanently:** update the Edge Function in
Supabase dashboard → Edge Functions → generate-rehearsals.

### Attendance ("Can You Be There?")

Members declare their attendance intent at `/members/attendance.html`. The page
has two columns: rehearsals (left) and sing-outs/events (right).

**Rehearsals:** members are assumed attending unless they say otherwise — same
model as the existing absence feature.

**Sing-outs and non-rehearsal events:** three-state status —
`attending` / `not_sure` / `not_attending`. Members can update their status
any time before the event. Status is stored in the `event_attendance` table.

**Batch save:** Members make local selections (dropdowns on the page); a single
"Save" button batch-writes all changed rows to Supabase. On success, shows
"Saved ✓" confirmation.

**Notification on save:** A Supabase Edge Function (`notify-attendance-change`)
fires after the Save succeeds and:
- Sends the musical director an email with the member's status summary
- Sends the member a confirmation email (includes full event details if attending)
- Director email includes a deep-link to the admin attendance census report
  for that event

**Admin census report:** `/members/admin-attendance.html` — visible to
`admin` and `musical_director` roles only. Shows attending / not sure /
can't make it / no response for each upcoming event. Accepts `?event=<uuid>`
deep-link from director notification emails.

**Event fields used by attendance:** When creating or editing a non-rehearsal
event, fill in `call_time`, `address`, `dress_code`, and `parking_notes` in
addition to the standard fields — these appear on member attendance cards and
in confirmation emails. `address` is the street address (used for the Google
Maps link); `location` is the human-readable venue name.

**Deferred features** (see pdt-issues.md #031–#033):
- Escalation pipeline: 10-day nudge emails reminding members with `not_sure` status to commit; 7-day auto-mark to `not_attending` with director notification
- Admin override: Kevin entering clipboard attendance marks from rehearsals
- Attendance report: director-facing census with voting breakdown and no-response tracking

### Year-End Rehearsal Population

`scripts/populate-rehearsals.js` is a standalone Node script run once each December
to bulk-load all Monday rehearsals for the coming year. It is **not** part of the site —
run it manually from the terminal.

**What it does:** deletes any existing Monday rehearsal events for the target year,
then inserts one event per Monday through December 31. Safe to re-run — the delete
step ensures no duplicates.

**Run command:**
```bash
SUPABASE_URL=https://your-project-ref.supabase.co \
SUPABASE_SERVICE_KEY=your-service-role-key \
node scripts/populate-rehearsals.js 2027
```

- `SUPABASE_URL` — find in Supabase dashboard → Project Settings → API → Project URL
- `SUPABASE_SERVICE_KEY` — find in Supabase dashboard → Project Settings → API → Service Role secret key (not the anon key)
- Year argument is optional; omit it to populate the current calendar year

**When to run:** each December, pass the coming year as the argument (e.g. `2027`).
The script skips past Mondays and only inserts from today forward when run mid-year.

---

## 9. Music Library

Sheet music and learning tracks are served from Google Workspace Drive
(`president@pdtsingers.org`). The Music Library is fully populated. Members never
interact with Google directly.

**Drive location:** `Music/` folder in president@pdtsingers.org Workspace Drive  
**Folder ID:** set in Netlify — Site configuration → Environment variables → `GOOGLE_DRIVE_MUSIC_FOLDER_ID`  
**Service account:** `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`

**Photos folder ID:** `1-5HgzbPN3ydHXcrInJ2xW3aU2WWFSgw1` (Workspace Drive, `/Photos/`)  
**Carousel folder ID:** `11RlCH-UEcqTaIg4CPiCpP65B0-Za_rEh` (Workspace Drive, `/Photos/Mainpage_Carousel/`)

**How downloads work:**
- **Folder and file listings** — `netlify/functions/drive-music.js` (serverless). Returns JSON; no file content passes through.
- **File downloads** — `netlify/edge-functions/drive-music-download.js` (Deno Edge Function, `/api/music-download`). Streams file content directly from Drive to the browser — no buffering, no size ceiling, service account token never leaves the function.

Do not construct direct `drive.google.com` download URLs in client code — they bypass the service account and will 403.

**File size note:** keep individual files under ~6MB raw (~4.5MB before base64 expansion) as a soft guideline for audio quality and load time. Very large MP3s at high bitrate are worth compressing.

**To add a new song:**
1. Create a new folder inside `Music/` named exactly as you want it to appear on the page
2. Drop in the PDF (sheet music) and MP3 learning tracks
3. That's it — the Music Library picks it up automatically on next load

**File naming for learning tracks:** include the voice part in the filename
(Tenor, Lead, Bari/Baritone, Bass) so the page sorts the member's own part to the top.

---

## 10. The Sunburst Newsletter

The Sunburst is a PDF newsletter produced by Kevin from member-submitted content.
Issues are stored as PDFs in Google Drive and served directly to the member portal —
no database rows, no CMS.

### Storage

**Drive location:** `Sunburst/` folder in president@pdtsingers.org Workspace Drive  
**Folder ID:** set in Netlify — Site configuration → Environment variables → `GOOGLE_DRIVE_SUNBURST_FOLDER_ID`  
**Service account:** `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com` (Viewer) — same account used by the Music Library

### File naming convention

```
YYYY-MM-DD — Title.pdf
```

The separator is an em dash (U+2014) with a space on each side. The member portal
listing parses filenames to extract the date and title — there is no metadata sidecar.

**Example:** `2026-05-01 — Spring Sing-Out Edition.pdf`

Files that do not match the pattern (no em dash) are still listed; they display the
raw filename (minus the `.pdf` extension) with no date.

### Adding a new issue

1. Ray sends Kevin the article content (usually as a `.docx`)
2. Open `sunburst-issue-template.html` (repo root) in a text editor — paste the content into the `<!-- BODY CONTENT -->` area and fill in the issue date and title placeholders in the masthead
3. Open the file in Chromium. Print: **Cmd+P → Save as PDF → Margins: None → Background graphics: checked**
4. Rename the downloaded PDF to match the naming convention above
5. Upload the PDF to the `Sunburst/` folder in Google Drive

The member portal page (`/members/sunburst.html`) reflects new files automatically
on next load — no code changes, no deploy needed.

### API

- **Issue listing** — `netlify/functions/drive-music.js` with `action=sunburst-list`. Returns `[{ id, date, title }]` sorted newest-first.
- **File delivery** — `netlify/edge-functions/drive-music-download.js` at `/api/music-download`. Same streaming infrastructure as the Music Library — no buffering, no size ceiling, service account token stays server-side.

---

## 11. Email (OTP Login)

Login codes (6-digit OTP) are sent via Resend (resend.com), wired into Supabase SMTP.

**From address:** noreply@pdtsingers.org  
**Resend domain:** pdtsingers.org — verified April 2026  
**OTP expiry:** 10 minutes / 600 seconds (confirmed in Supabase → Authentication → Settings)  
**Template:** Supabase dashboard → Authentication → Email Templates → Magic Link (code display template)

**Login flow:**
1. Member enters email address
2. Clicks "Send me a login code"
3. Receives 6-digit numeric code by email
4. Enters code on verify screen
5. Redirected to `/members/`

**Security detail:** The auth call uses `shouldCreateUser: false`, which means Supabase
will only send a code to accounts that already exist in the system. Strangers entering
a random email get no response — no code, no error, no confirmation. This is intentional.

**Magic link code:** Code to switch back to magic links is preserved in `login.js` behind
`const USE_MAGIC_LINKS = false`. Do not enable without explicit direction from Kevin.
Magic link route uses `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`
with email delivery method instead of OTP.

If members report not receiving login codes:
1. Check Resend dashboard for delivery status
2. Ask member to check spam folder
3. Verify their email address in Supabase matches exactly what they're entering
4. Confirm their account has `is_active = true` in the profiles table

**Transactional email for attendance notifications** also routes through Resend, triggered
by Supabase Edge Functions (not Supabase SMTP). The `RESEND_API_KEY` for this is stored
in Supabase Edge Function secrets, not Netlify env vars.

---

## 12. Forms

Public forms (Join Us, Contact, Performances booking inquiry) are handled by
Netlify Forms. Submissions appear in: Netlify dashboard → Forms.

Free tier limit: 100 submissions/month — more than sufficient.

Email notifications for form submissions can be configured in:
Netlify → Forms → [form name] → Form notifications.

---

## 13. Common Tasks Quick Reference

| Task | Where |
|------|-------|
| Add a member | Supabase → Authentication → Users |
| Deactivate a member | Supabase → Table Editor → profiles → is_active = false |
| Change a member's role | Supabase → Table Editor → profiles → role |
| Add a song to Music Library | Drop folder + files in Google Drive Music/ folder |
| Cancel a rehearsal | Calendar page (admin view) → mark Cancelled |
| View attendance census | Members portal → Attendance Report (admin/director only) |
| Check Edge Function logs | Supabase → Edge Functions → [function name] → logs |
| View form submissions | Netlify → Forms |
| Update env variables | Netlify → Site configuration → Environment variables |
| Edit OTP login email template | Supabase → Authentication → Email Templates |
| Trigger a deploy | Netlify → Deploys → Trigger deploy |
| View Music Library logs | Netlify → Functions → drive-music (listings) or Edge Functions → drive-music-download (downloads) |

---

## 14. Architecture Summary

```
Browser
  └── pdtsingers.org (Netlify CDN)
        ├── Static HTML/CSS/JS files (GitHub repo)
        ├── inject-env.js (Netlify Edge Function)
        │     └── Injects SUPABASE_URL, SUPABASE_ANON_KEY, DRIVE credentials
        ├── drive-music.js (Netlify Function)
        │     └── Authenticates to Google Drive via service account
        │     └── Returns song/file listings to Music Library page
        ├── drive-music-download.js (Netlify Edge Function — /api/music-download)
        │     └── Streams Drive file content directly to browser
        │     └── No buffering, no size ceiling; token never leaves function
        └── Netlify Forms (public form submissions)

Authentication: Supabase (email → OTP code via Resend SMTP; shouldCreateUser: false)
Database: Supabase (profiles, events, absences, event_attendance, posts tables)
Edge Functions: Supabase
  ├── generate-rehearsals — weekly cron; creates Monday rehearsals 12 weeks out
  ├── notify-attendance-change — database trigger; fires on event_attendance upsert
  └── send-attendance-emails — nightly cron; 10-day nudge emails (deferred, Issue #031)
Music files: Google Workspace Drive (president@pdtsingers.org)
Email (transactional): Resend (resend.com)
  — OTP code delivery via Supabase SMTP (currently active)
  — Attendance notifications via Edge Function direct API calls
Email (group): Google Workspace Gmail + Groups
Domain: pdtsingers.org at Helping Hosting → Netlify DNS
GCP project: pdt-singers-music-library (service account for Drive proxy)
```

---

## 15. Known Issues & Backlog

Issues are tracked in `pdt-issues.md` in the repo root, maintained by CC.
Run `cat pdt-issues.md` to see the current list.

### Deferred Attendance Features (Issues #031–#033)

Three post-launch features are planned for the attendance system:

**#031 (FWI-A) — Escalation pipeline**: 10-day nudge emails reminding members with `not_sure` status to commit either way; 7-day auto-mark to `not_attending` with director notification; requires new `send-attendance-emails` Edge Function and pg_cron job setup in Supabase.

**#032 (FWI-B) — Admin override**: Kevin entering clipboard attendance marks from in-person rehearsals; new admin form at `/members/admin-attendance-override.html` or integrated into admin panel; upserts to same `event_attendance` table; notifies director same as member saves.

**#033 (FWI-C) — Attendance report**: Director-facing census view for any sing-out showing all three voting states plus members who haven't responded; can be a dedicated report page or integrated into admin panel.

---

## Retired / Suppressed Pages

**Communications (members/comms.html)** — retired April 2026.
Was a board announcement feed (blog_type='comms'). Removed because the
existing Director's Notes and Poohbahs' Prattlings blogs serve the same
purpose. If a general announcement channel is needed in future, restore
this page and add a nav link. The posts table comms rows (if any) remain
in the DB — no data was deleted.

**Resources (members/resources.html)** — suppressed April 2026.
Page exists but nav link removed. Content and purpose TBD. Re-add the nav
link when the page has content worth surfacing.

---

## 16. Claude.ai MCP Connectors

Claude.ai (the chat interface used for all PDT website work) supports MCP connectors that give Claude direct access to external services — Google Drive, Gmail, Stripe, and others. The PDT project has evaluated the available connectors.

**Connector status as of April 2026:**

| Connector | Status | When useful |
|-----------|--------|------------|
| Google Drive | Disconnected | Not needed for website work — CC reads all files via the repo. Re-enable only if you want claude.ai to directly browse or read files from the PDT Workspace Drive during a planning session. |
| Gmail | Disconnected | Not needed for website work. Re-enable if you want claude.ai to help draft or read emails from president@pdtsingers.org during a session. |
| Stripe | Not relevant | PDT does not use Stripe. Leave disconnected. |

**General principle:** MCP connectors are session-scoped. Connecting them gives claude.ai live access to that service during the conversation — useful for specific tasks, not needed for routine coding work. Disconnect after use if you prefer not to grant standing access.

**How to manage connectors:** In claude.ai, open the PDT project → Settings → Connected tools (or similar — exact UI may vary). Connect or disconnect per session as needed.

---

## 17. Deferred Features — Video Upload

Video upload to the photo system was explicitly deferred during initial design
(April 2026). This section documents what was decided and why, so future
maintainers have the context.

### What was considered

Member-uploaded videos (sing-out clips, rehearsal highlights, etc.) were
discussed as a natural companion to photo uploads. The proposed flow would
mirror the photo upload pipeline: member selects video file on phone, uploads
via Netlify Edge Function to Google Drive, metadata in Supabase, playback or
download from a member gallery page.

### Why it was deferred

Videos introduce complexity that photos don't have:

- **File sizes are large.** A 1-minute iPhone video at 1080p is 60–150MB;
  4K clips run 300–500MB. Upload times on a phone connection are painful,
  and Drive storage adds up quickly.
- **Format fragmentation.** iPhone shoots `.mov` (H.264 or HEVC). Android
  shoots `.mp4`. HEVC (H.265) is not universally browser-supported.
  A transcoding step (like the HEIC→JPEG conversion for photos) would be
  needed for consistent playback.
- **Playback is different from photos.** Thumbnails, inline `<video>` players,
  buffering, and mobile autoplay restrictions make the gallery UX substantially
  more complex than a photo lightbox.
- **Low near-term demand.** The chorus doesn't yet have a library of videos to
  show, and the photo system is higher priority for launch.

### What was decided

- V1 of the photo system supports JPEG and HEIC only. Videos are not accepted.
- If a member wants to share a video, Kevin uploads it manually to a designated
  Drive folder and links it from a blog post or the Comms page.
- Video upload will be revisited if member demand is clear and sustained.

### Open questions if video is ever built

- Accepted formats: `.mp4` only? Or also `.mov`?
- Transcoding: server-side (Supabase Edge Function + ffmpeg?) or accept as-is
  and rely on browser H.264 support?
- Storage: same `/Photos/` folder in Drive, or a separate `/Videos/` folder?
- Playback: inline `<video>` player in gallery, or download-to-watch?
- File size cap: a hard limit (e.g., 100MB) enforced client-side before upload?
- Public video access: same `is_public` flag + carousel pattern, or a separate
  public video page?

---

## 18. Photo System

The photo system (issues #014 and #015) handles member photo uploads, admin curation, the home page carousel, and HEIC-to-JPEG conversion. It is fully implemented in code as of Session 16 (2026-04-26) but pending Google Workspace Drive provisioning before end-to-end testing can complete.

### Storage Architecture

Photos are stored in Google Workspace Drive under `president@pdtsingers.org` in two folders:

| Folder | Netlify Env Var | Purpose |
|--------|----------------|---------|
| `/Photos/` | `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` | All member-uploaded photos |
| `/Photos/Mainpage_Carousel/` | `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` | Curated public carousel photos (copies only) |

Both folders are shared with the service account `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com` (Writer on `/Photos/`, inherited by `/Photos/Mainpage_Carousel/`). Photos are never publicly shared in Drive — all access goes through the proxy functions.

Photo metadata (Drive file ID, uploader, event association, curation status, HEIC conversion status) is stored in the Supabase `photo_uploads` table. Members never interact with Drive directly.

### Supabase Schema

The `photo_uploads` table tracks every uploaded photo:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `drive_file_id` | text | Drive file ID |
| `carousel_file_id` | text | Drive file ID of the carousel copy (null if not curated) |
| `uploaded_by` | uuid | FK → profiles(id) |
| `event_id` | uuid | FK → events(id), nullable |
| `is_public` | boolean | false = members only; true = shown in carousel |
| `conversion_status` | text | pending / processing / done / failed |
| `conversion_error` | text | Error message if conversion failed |
| `filename` | text | Timestamped filename stored in Drive |

**Migrations to run in Supabase SQL editor (in order, before first use):**
1. `supabase/migrations/20260426_photo_uploads.sql`
2. `supabase/migrations/20260426_photo_uploads_carousel_file_id.sql`

Do not run `convert_heic_cron.sql` — it was deleted; replaced by GitHub Actions.

### Supabase Edge Function Secrets Required

Set in Supabase → Edge Functions → Manage secrets:

| Secret | What it is |
|--------|-----------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON (same value as Netlify env var) |
| `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` | ID of `/Photos/` folder |
| `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` | ID of `/Photos/Mainpage_Carousel/` subfolder |
| `RESEND_API_KEY` | Resend API key for HEIC failure notifications |

These are separate from the Netlify env vars of the same names. Both systems need them.

### Netlify Edge/Serverless Functions

| Function | Path | Purpose |
|----------|------|---------|
| `upload-photo.js` | Netlify Edge Function | Receives multipart upload, extracts EXIF, uploads to Drive, inserts Supabase row |
| `photo-proxy.js` | Netlify Edge Function | Streams Drive photo to browser; auth-gated for members-only photos |
| `curate-photo.js` | Netlify Edge Function | Admin toggle: make public (copy to carousel folder) or unpublish (delete carousel copy) |

### HEIC Conversion — GitHub Actions + Supabase Edge Function

iPhone photos in HEIC format are converted to JPEG in a background job after upload.

**Trigger:** `.github/workflows/convert-heic.yml` — GitHub Actions scheduled workflow, fires every 15 minutes. Calls the `convert-heic` Supabase Edge Function via HTTP POST. No GCP Cloud Scheduler, no Netlify scheduled functions — GitHub Actions is free and requires no billing account.

**Library:** `heic-to@1.4.2` (npm) — WASM-based via Emscripten/libheif. Confirmed deployable on Supabase Edge Runtime (Deno). Do not substitute with `jsquash` or other alternatives without testing — see `pdt-decisions.md` for the evaluation history.

**GitHub Actions secret required:** `SUPABASE_SERVICE_ROLE_KEY` — set in GitHub → repository Settings → Secrets and variables → Actions. Already set as of Session 16.

**Conversion flow:**
1. HEIC uploaded to Drive with `conversion_status = 'pending'`
2. Every 15 minutes, `convert-heic.yml` fires
3. Edge Function queries `photo_uploads` for `conversion_status = 'pending'`
4. Converts each HEIC to JPEG (max quality), writes JPEG to same Drive folder
5. Verifies the JPEG Drive file ID, then deletes the original HEIC
6. Updates `photo_uploads` row: new `drive_file_id`, `conversion_status = 'done'`
7. On failure: sets `conversion_status = 'failed'`, records error in `conversion_error`, sends email to `tech@pdtsingers.org` via Resend

Non-HEIC uploads (JPEG) land with `conversion_status = 'done'` and are never processed by this job.

### Member Gallery Page

`/members/photos.html` — auth-gated, member role or higher. Features:
- Event picker (last 90 days of events with photos, expandable)
- Fixed-aspect photo grid grouped by event
- Upload modal: up to 8 photos per operation (JPEG and HEIC only), progress counter
- Lightbox with prev/next navigation and single-photo download
- Admin/events_editor: inline curation toggle (Make public / Unpublish)

### Home Page Carousel

`js/carousel.js` — shared module used by `index.html` and `friends.html`. Feeds from `/Photos/Mainpage_Carousel/` via `photo-proxy.js`. Displays in random order client-side. Shows logo placeholder on load, swaps in Drive photos as they arrive. Lazy-loads next image.

All photos in the carousel are curated — only admins or events_editors can mark a photo as public, which triggers the copy to the carousel folder.

### Drive Recovery Procedure

If Workspace Drive access is lost (e.g., trial account cancellation, service account key rotation, Drive provisioning reset):

1. **Verify service account still exists** in GCP Console → IAM & Admin → Service Accounts → `pdt-singers-music-library`. If it was deleted, create a new key and update `GOOGLE_SERVICE_ACCOUNT_JSON` in both Netlify env vars and Supabase Edge Function secrets.
2. **Verify folder sharing** — in Drive, right-click each folder (Music, Sunburst, Photos, Photos/Mainpage_Carousel) → Share → confirm service account email has at minimum Viewer access (Writer for Photos).
3. **Re-upload Music Library files** if Drive was provisioned fresh — files must be manually re-uploaded from Dropbox (the source). Folder structure under `Music/` is the only metadata; filenames must include voice part for the sort feature to work.
4. **Photos folders** — if `/Photos/` and `/Photos/Mainpage_Carousel/` need to be recreated, create them, share with service account (Writer), grab the new folder IDs, and update `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` and `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` in both Netlify env vars and Supabase Edge Function secrets.
5. **Test after any credential change** by visiting Music Library and Photos pages while logged in. Check Netlify Function logs if listings fail; check Edge Function logs if downloads/proxy fail.

### GCP Project

**Project:** `pdt-singers-music-library`  
**Primary owner:** `tech@pdtsingers.org`  
**Legacy co-owner:** `pdtsingers.music@gmail.com` — remove post-release (issue #060)  
**Service account:** `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`  
**What GCP is used for:** Service account JWT signing for Drive API access only. No Cloud Functions, no Cloud Scheduler, no Cloud Storage. The only GCP resource that matters is the service account and its key.

The GCP dashboard may show 100% error rates on APIs like Privileged Access Manager and Cloud Storage — these are enabled by default in new GCP projects and generate probe traffic that returns errors because they're unused. Ignore them. Only the Drive API errors column matters; it should be 0%.

---

*PDT Singers · pdtsingers.org · Lodge #18, WBQA · Music, Fellowship & Fun*

<!-- html-synced: 2026-04-26 — §10 OTP expiry TODO resolved -->
