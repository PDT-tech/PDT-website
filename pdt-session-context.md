# PDT Singers Website — Session Context

**Last updated:** 2026-05-12 (Session 24 — Photo upload UX fixes; Music Library #085; decisions logged)
**Requirements doc:** `pdt-requirements.md`
**Decision log:** `pdt-decisions.md`
**Issue tracker:** `pdt-issues.md` (CC-owned, repo root)
**Session history:** `pdt-session-history.md`

---

## How to Use This Document

Paste the **Project Summary** section into any new Claude session to resume work
without re-explaining the project. The rest of this doc is current-state reference.
Session history has been moved to `pdt-session-history.md`.

---

## Project Summary ← paste this into any new session

We are hand-coding a website for **Portland DayTime Singers (PDT Singers)**, a men's
barbershop chorus in Portland, Oregon that performs sing-outs for seniors in care
facilities and the community, and recruits male singers. PDT Singers is
**Lodge #18 of the Worldwide Barbershop Quartet Association (WBQA)**, co-founded by
director **Chris Gabel** and **Kevin Bier** (Grand Poohbah / president).
NOT affiliated with BHS — state clearly on About page.

**Domain:** pdtsingers.org — live on Netlify. DNS cutover complete.

**Tech stack:**
- Hand-coded HTML5 / CSS3 / vanilla JS — no frameworks, no WordPress, no build step
- Hosted on **Netlify** (free tier) — manual deploy only (auto-publish always locked)
- Auth via **Supabase** — email → 6-digit OTP code via Resend SMTP; admin-created accounts
  only (`shouldCreateUser: false`); `is_active` flag gates portal access
- Database via **Supabase** — profiles, events, event_attendance, absences, posts, photo_uploads tables
- Forms via **Netlify Forms**
- **Netlify Functions** — serverless Drive proxy for Music Library and Sunburst newsletter
- **Netlify Edge Functions** — `inject-env.js` (env var injection), `drive-music-download.js`
  (streaming downloads), `drive-music-upload.js` (Music Library admin writes), `upload-photo.js`,
  `photo-proxy.js`, `curate-photo.js`
- Source control: **GitHub** — https://github.com/PDT-tech/PDT-website
- Email (transactional): **Resend** (resend.com) — noreply@pdtsingers.org
- Email (group): **Google Workspace for Nonprofits** — president@pdtsingers.org (active)
- Music + Photo files: **Google Workspace Drive** — president@pdtsingers.org, served via service
  account proxy (impersonates tech@pdtsingers.org via domain-wide delegation)
- GCP project: `pdt-singers-music-library` — service account for Drive proxy

**Owner/maintainer:** Kevin Bier (president@pdtsingers.org) — experienced software/product
exec (C++, 25+ yrs product leadership at HP/Microsoft/Nike). Talk architecture and
tradeoffs, not basics.

**Design:** Palette from PDT logo watercolor wash (sky blues + cream + forest dark + gold).
Fonts: Playfair Display + Source Serif 4. Tone: warm, community-focused, first-person plural.
Tagline: "Music, Fellowship & Fun."

**Terminology:** They do **sing-outs**, not concerts. Director is **Chris Gabel** (German
spelling — not "Gable"). Moss Egli (Social Media Manager) uses she/her pronouns.

**Key people:**
- Kevin Bier — Grand Poohbah, co-founder, tech maintainer, admin role
- Chris Gabel — Musical Director, co-founder, musical_director role
- Moss Egli — Social Media Manager, events_editor role, onboarded April 2026
- Ray Heller — High Council, produces The Sunburst newsletter
- Sam Vigil — handles recruiting outreach
- Grant Gibson — Secretary-Treasurer

**Claude Code (CC) workflow:** CC has full live repo context. Default to CC prompts for
all repo changes. claude.ai produces new files that don't yet exist; everything else is
a CC prompt. Always commit AND push to origin after changes. Netlify auto-publish is
always locked — Kevin manually triggers deploys from the Netlify dashboard.

---

## Current State (as of 2026-05-12)

### Phase 1 — Member Portal ✅ Complete
All member portal features are live and functional:
- Login (OTP email code, 10-minute expiry, 60-second cooldown on resend)
- Member dashboard with role-based card display
- Director's Notes blog (musical_director + admin)
- Poohbahs' Prattlings blog (admin only)
- Events blog (events_editor + admin) — with calendar → blog prompts for new/cancelled events
- The Sunburst newsletter (Drive-backed PDF listing, admin posting, gold accent)
- Chorus calendar with full event CRUD, absence tracking, cancellation flow
- "Can You Be There?" attendance page — two-cluster dropdown UI (sing-outs left, rehearsals right)
- Admin attendance override page
- Sing-out attendance census report (admin/director)
- Music Library (Drive-backed, accordion UI, voice-part sorting, streaming downloads, admin upload/delete live — musical_director + tech + admin roles)
- Member account management (admin-created accounts only)
- **Member Photos** — upload, gallery, curation, carousel ✅ fully live (#014/#015 closed Session 22)

### Phase 2 — Public Site ✅ Complete
All public pages live:
- index.html (Home — carousel live, positioned between WHO WE ARE and UPCOMING SING-OUTS)
- about.html
- performances.html (with Netlify booking inquiry form)
- join.html
- music.html
- friends.html (with live Facebook page link; carousel live)
- contact.html
- 404.html

### Ops & Infrastructure ✅ Complete
- Google Workspace for Nonprofits — approved and active (via Goodstack, April 2026)
- Music Library Drive folders populated from Dropbox — Dropbox retired
- Moss Egli onboarded — Supabase account, events_editor role, Facebook group setup
- Resend transactional email — domain verified, OTP delivery confirmed working
- Facebook page live
- Lodge #18 permanent status confirmed
- 501(c)(3) confirmed — IRS letter in hand
- Vector logo files received from Mercedes Gibson
- README.md fully rewritten (Issue #052)
- pdt-issues.md, pdt-decisions.md, pdt-conventions.md, CLAUDE.md all in repo
- Duane Lundsten memorial plaque approved
- Photos Drive folders live: `/Photos/` and `/Photos/Mainpage_Carousel/` under president@pdtsingers.org
- GitHub Actions HEIC workflow re-enabled ✅ (Session 22)

### Open Items
Tracked in `pdt-issues.md` (CC-owned). Current open issues as of 2026-05-11:

| # | Item |
|---|------|
| 026 | Kevin Bier profile: role='member', voice_part=null — should be admin/bass. Fix manually in Supabase. |
| 028 | Migrate all website tool accounts to tech@pdtsingers.org |
| 031 | Attendance escalation pipeline — deferred post-launch |
| 071 | Calendar/Events Option C refactor — dedicated session, after HC sign-off |
| 081 | POST-V1: Home page UPCOMING SING-OUTS — populate dynamically from events table (performance/sing-out types, next 90 days) |
| 082 | POST-V1: Performances page — populate sing-out listings dynamically from events table, same logic as #081 |

### Session 23 Completed
- **#080** ✅ — Carousel moved to correct position in index.html (between WHO WE ARE and UPCOMING SING-OUTS)
- **#079** ✅ — Carousel re-enabled on index.html and friends.html; max-width: var(--max-width), margin: 0 auto
- **Carousel DWD scope bug** ✅ — drive-music.js getAccessToken now uses `drive` scope when subject is non-null (DWD path), `drive.readonly` otherwise. Root cause: Workspace Admin DWD grant covers `drive` but not `drive.readonly` as a distinct scope string.
- **pdt-conventions.md** ✅ — claude.ai/CC division of responsibility documented

### Session 24 — Completed ✅
- ✅ Event dropdown 90-day cutoff bug — extended to 180 days; Feb 1st sing-out now visible
- ✅ Rehearsals excluded from both event dropdowns by default
- ✅ Future events excluded from both event dropdowns
- ✅ Upload modal label clarity — "View photos from this event:", "Upload photos for this event:", "Upload these photos (JPEG or HEIC):"
- ✅ "Show older events" checkbox → "Include events older than 6 months"; correctly excludes future events even when checked
- ✅ Upload modal pre-populates event from view filter on open
- ✅ Stale upload status message fixed — cleared on modal open; shows "Ready to upload N photo(s)" on file selection
- ✅ Admin bulk upload override — #upload-bulk-override checkbox (admin-only, pdt-admin-only class); raises limit 8→100; large-upload warning shown; ZIP import retired
- ✅ #085 — PDF extension now visible in Music Library file label; audio rows unchanged
- ✅ Decisions logged — flat /Photos/ folder rationale; ZIP import retired; admin bulk upload replaces both

### Session 25 Priorities
1. Netlify migration follow-up — still blocking deploy of Music Library upload/delete and photo uploader fix; check status
2. Photo uploader end-to-end test — pending Netlify migration resolution (reentry sequence in pdt-photo-feature.md)
3. Music Library upload/delete — pending Netlify migration resolution
4. Drive folder structure — decided: flat /Photos/, no subfolders (documented in pdt-decisions.md)
5. Moss Egli Supabase onboarding — still pending
6. Grant Gibson as second owner — critical operational risk, still unresolved

### Deferred (do not pick up unless Kevin raises)
- Responsive width fix on carousel (low priority)
- See Standing Backlog below.

### Retired This Session
- ZIP photo import — replaced by admin bulk upload override (100-file cap)
- Admin Drive folder import tool — obviated by bulk upload override

### Standing Backlog
- Supabase account migration — pending support (email suppression issue)
- May 28: verify Workspace nonprofit SKU zeroed billing before May 31 charge date
- Attendance escalation pipeline (#031) — 10-day nudge emails, 7-day auto-mark
- SEO: meta tags, XML sitemap, Google Search Console
- Mobile responsiveness audit (WCAG AA)
- Public page content polish — real copy, real photos
- The Sunburst: public-facing version under Friends page (not yet started)
- Vacation block feature — member self-service away window (design discussion needed)
- Facebook Events cross-posting — requirements TBD with Moss (Phase 3+)
- #071 Option C refactor (Calendar/Events) — after HC sign-off
- #081/#082: Dynamic sing-out listings on home page and performances page from events table
- Polling/voting feature — spec drafted Session 19, not yet built
- Grant Gibson as second owner on all services — critical operational risk

---

## Document Consistency Note (2026-04-26)

A cross-document consistency audit was performed in Session 15. All four operating docs —
`pdt-session-context.md`, `pdt-decisions.md`, `pdt-conventions.md`, and
`pdt-tech-maintainers-guide.md` — were reviewed and brought into alignment. The session
context doc was split into this file (current state) and `pdt-session-history.md` (archive).
The HTML version of the maintainers guide was also synced with its markdown.

**Standing rule:** The markdown is always the authoritative working document. HTML versions
(if any) are presentation-only and updated periodically (roughly weekly). Never modify an
HTML version as the primary edit target.

---

## Architecture Summary

```
Browser
  └── pdtsingers.org (Netlify CDN)
        ├── Static HTML/CSS/JS files (GitHub repo)
        ├── inject-env.js (Netlify Edge Function)
        │     └── Injects SUPABASE_URL, SUPABASE_ANON_KEY, DRIVE credentials into window.__PDT_ENV
        ├── drive-music.js (Netlify Function)
        │     └── Authenticates to Google Drive via service account JWT
        │     └── Returns song listings (music-list) and Sunburst PDF listings (sunburst-list)
        ├── drive-music-download.js (Netlify Edge Function — /api/music-download)
        │     └── Streams Drive file content directly to browser
        │     └── No buffering, no size ceiling; service account token never leaves function
        └── Netlify Forms (public form submissions)

Authentication:  Supabase (email → 6-digit OTP via Resend SMTP; shouldCreateUser: false)
Database:        Supabase (profiles, events, event_attendance, absences, posts tables)
Edge Functions:  Supabase
  ├── generate-rehearsals — weekly cron; creates Monday rehearsals 12 weeks out
  ├── notify-attendance-change — database trigger; fires on event_attendance upsert
  └── send-attendance-emails — nightly cron; 10-day nudge emails (deferred, Issue #031)
Music files:     Google Workspace Drive (president@pdtsingers.org)
  └── Music/ folder — song subfolders with PDF + MP3 tracks
  └── Sunburst/ folder — PDF issues named YYYY-MM-DD — Title.pdf
Email (transactional): Resend — OTP codes + attendance notifications
Email (group):   Google Workspace Gmail + Groups
Domain:          pdtsingers.org at Helping Hosting → Netlify DNS
GCP project:     pdt-singers-music-library
Service account: pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com
```

---

## Netlify Environment Variables (6 set)

| Key | What it is |
|-----|-----------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `GOOGLE_DRIVE_API_KEY` | Drive API key (local dev direct calls only) |
| `GOOGLE_DRIVE_MUSIC_FOLDER_ID` | ID of the Music folder in Workspace Drive |
| `GOOGLE_DRIVE_SUNBURST_FOLDER_ID` | ID of the Sunburst newsletter folder in Workspace Drive |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON (secret); used by Netlify Function |
| `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` | ID of the /Photos/ folder in Workspace Drive |
| `GOOGLE_DRIVE_CAROUSEL_FOLDER_ID` | ID of the /Photos/Mainpage_Carousel/ folder in Workspace Drive |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key; used by GitHub Actions to trigger convert-heic |

Supabase Edge Function secrets (separate system — set via `supabase secrets set`):

| Key | What it is |
|-----|-----------|
| `RESEND_API_KEY` | Resend API key for attendance notification emails |
| `SITE_URL` | `https://pdtsingers.org` — used in email deep-links |

---

## File / Folder Structure (current)

```
PDT-website/                      ← repo root
├── index.html                    ← Home (public)
├── about.html
├── performances.html             ← Includes Netlify booking inquiry form
├── join.html
├── music.html                    ← "Our Music" public page
├── friends.html
├── contact.html
├── 404.html
├── login.html                    ← OTP login; USE_MAGIC_LINKS = false flag
├── members/
│   ├── photos.html               ← Member photo gallery, upload modal, admin curation
│   ├── photos.css                ← Photo gallery styles
│   ├── index.html                ← Member dashboard
│   ├── directors-notes.html      ← Blog — Chris Gabel
│   ├── poohbah.html              ← Blog — Kevin Bier (Poohbahs' Prattlings)
│   ├── events.html               ← Events blog (performances, sing-outs, socials)
│   ├── sunburst.html             ← The Sunburst newsletter (Drive-backed PDF listing)
│   ├── calendar.html             ← Chorus calendar + event CRUD + absence tracking
│   ├── music.html                ← Music Library (Drive proxy, streaming downloads)
│   ├── attendance.html           ← "Can You Be There?" member self-service
│   ├── admin-attendance.html     ← Admin override + sing-out census report
│   ├── resources.html            ← Suppressed from nav (file retained, content TBD)
│   └── js/
│       └── attendance.js         ← Attendance page logic (shared by attendance + admin pages)
├── netlify/
│   ├── edge-functions/
│   │   ├── inject-env.js         ← Injects all env vars into window.__PDT_ENV at runtime
│   │   ├── drive-music-download.js ← Streams Drive files to browser (/api/music-download)
│   │   ├── drive-music-upload.js ← Music Library admin writes (/api/music-upload)
│   │   ├── upload-photo.js       ← Receives photo upload, writes to Drive + photo_uploads row
│   │   ├── photo-proxy.js        ← Proxies Drive photo bytes to browser (auth-gated)
│   │   └── curate-photo.js       ← Admin: promote photo to carousel / remove from carousel
│   └── functions/
│       └── drive-music.js        ← Drive proxy: listings for Music Library + Sunburst
├── supabase/
│   ├── functions/
│   │   ├── generate-rehearsals/  ← Weekly cron — creates Monday rehearsals 12 weeks out
│   │   ├── notify-attendance-change/ ← DB trigger — emails on attendance upsert
│   │   ├── send-attendance-emails/   ← Nightly cron — nudge emails (deferred #031)
│   │   └── convert-heic/         ← HEIC → JPEG conversion (heic-to@1.4.2); triggered by GitHub Actions
│   └── migrations/
│       ├── 20260426_photo_uploads.sql              ← photo_uploads table ✅ run
│       └── 20260426_photo_uploads_carousel_file_id.sql ← carousel_file_id column ✅ run
├── css/
│   ├── reset.css
│   ├── variables.css             ← Design tokens (palette, type, spacing)
│   ├── main.css                  ← Public site styles
│   ├── members.css               ← Member portal nav + layout
│   ├── blog.css                  ← Blog page styles (shared by all five blogs)
│   ├── calendar.css              ← Calendar page styles
│   ├── attendance.css            ← Attendance page styles
│   └── sunburst.css              ← Sunburst newsletter styles (warm palette tokens)
├── js/
│   ├── supabase.js               ← Supabase client + auth helpers
│   ├── nav.js                    ← Public nav hamburger behavior
│   ├── main.js                   ← Public page scripts
│   └── carousel.js               ← Shared carousel module (home page + Friends page)
├── assets/
│   └── images/
│       ├── PDT_logo_bw.png
│       ├── PDT_logo_color_1.jpeg
│       ├── PDT_logo_color_2.jpeg
│       └── WBQA_logo.png
├── sunburst-issue-template.html  ← Standalone print-to-PDF tool for Sunburst production
├── netlify.toml                  ← Netlify config (edge function order matters)
├── CLAUDE.md                     ← CC standing instructions (conventions, issue tracking)
├── pdt-issues.md                 ← Issue tracker (CC-owned, never manually edited)
├── pdt-decisions.md              ← Architecture/design decision log (Kevin + claude.ai)
├── pdt-conventions.md            ← Coding conventions (CC reads at session start)
├── pdt-requirements.md           ← Full project requirements
├── pdt-session-context.md        ← This file (current state; uploaded to Project Memory)
├── pdt-session-history.md        ← Session log archive (Sessions 1–14)
├── pdt-tech-maintainers-guide.md ← Human-readable tech reference (markdown authoritative)
├── pdt-tech-maintainers-guide.html ← Presentation version of maintainers guide
├── investigate-before-you-design.md ← Pattern doc for pre-implementation investigations
├── README.md                     ← Repo onboarding (stack, local dev, deploy, structure)
├── .github/
│   └── workflows/
│       └── convert-heic.yml      ← GitHub Actions — triggers convert-heic Edge Function every 15 min
├── env.local.js                  ← gitignored — local dev credentials (never commit)
└── pdt-singers-music-library-*.json ← gitignored — service account key
```

---

## Key Reference Data

| Item | Value |
|------|-------|
| Rehearsals | Mondays 10:30am–12:30pm |
| Location | 13420 SW Butner Rd, Beaverton OR 97005 (Westside Journey UMC) |
| Voice placement | Sing Happy Birthday in comfortable range — not an audition |
| Performance fee | $150 standard 40-min; free for philanthropic/mission/recruitment |
| WBQA | sppbsqsus.org / facebook.com/WBQA.Sings |
| Charter | Lodge #18, WBQA Annual Convention, San Antonio TX, March 14, 2026 |
| GitHub | https://github.com/PDT-tech/PDT-website |
| Netlify project | astonishing-douhua-7cfbb7.netlify.app |
| Live site | pdtsingers.org ✅ |
| Supabase project | Americas region |
| GCP project | pdt-singers-music-library |
| GCP project owner | tech@pdtsingers.org (legacy: pdtsingers.music@gmail.com — issue #060 to clean up) |
| Service account | pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com |
| Goodstack (GWS) | ✅ Approved and active — TechSoup association code 4139-GERS-YP8U |
| 501(c)(3) | ✅ Confirmed — IRS letter in hand |
| Banking | OnPoint Credit Union |
| Facebook | ✅ PDT Singers page live |

---

## Notes & Gotchas

- **PDT Singers is NOT BHS** — stated on About page; some visitors assume BHS affiliation
- **Auth is OTP only** — 6-digit code via Resend; `USE_MAGIC_LINKS = false` in `login.html`;
  magic link code preserved behind the flag — do not delete it
- **OTP settings** — 10-minute expiry (600s), 6-digit code; confirmed working April 2026
- **shouldCreateUser: false** — strangers get no response when entering an email; only
  admin-created accounts receive codes
- **Five member blogs** — Director's Notes (`directors_notes`), Poohbahs' Prattlings
  (`poohbah`), Events (`events`), The Sunburst (`sunburst`), plus retired comms
- **Blog type constraint** — `posts_blog_type_check` allows: `directors_notes`, `poohbah`,
  `events`, `sunburst`. Note: `directors_notes` uses underscore (not hyphen) — constraint
  fixed Session 14
- **Roles** — `admin` (Kevin), `musical_director` (Chris), `events_editor` (Moss + others),
  `calendar_manager`, `council_member` (High Council), `member`
- **Music Library** — Drive is source of truth; no Supabase songs table. Production uses
  Netlify Function + service account JWT. Local dev uses API key + direct Drive calls
  (requires Music folder temporarily set to "Anyone with link" — revert after)
- **Authenticated downloads** — must use fetch → blob → `URL.createObjectURL` → synthetic
  anchor pattern. `window.open()` and `<a download>` cannot carry Authorization headers
  to the Edge Function (returns 401). See `pdt-conventions.md`
- **Sunburst file naming** — `YYYY-MM-DD — Title.pdf` (em dash U+2014, spaces around it);
  filename is the sole metadata source
- **Sunburst folder ID** — stored in `GOOGLE_DRIVE_SUNBURST_FOLDER_ID` Netlify env var
- **inject-env.js** — injects all 6 env vars into `window.__PDT_ENV`; safe to commit
- **env.local.js** — gitignored local file; mirrors `window.__PDT_ENV`; never commit
- **Role visibility** — use `applyRoleVisibility()` checking `window.__PDT_USER` directly,
  falling back to `pdt:profile-loaded` event; direct event listener alone has a timing race
- **Posts RLS** — insert/update/delete scoped by role+blog_type; three select policies:
  `posts_select_authenticated` (published, all members), `posts_select_admin` (all posts,
  admin only), `posts_select_author` (own drafts, any role)
- **members/comms.html** — retired April 2026; file deleted; posts table rows retained
- **members/resources.html** — suppressed from nav; file retained; content TBD
- **Netlify auto-publish** — always locked; Kevin manually triggers deploys
- **Netlify build credits** — Personal plan; ~65 deploys/month before ceiling
- **Supabase cold-start** — free tier pauses after ~1 week inactivity; first load may be
  slow (Issue #048, low priority)
- **pdtsingers.music@gmail.com** — staging account, not used; may dispose
- **Kevin is sole owner of all services** — critical single point of failure; second admin
  needed (Grant Gibson is natural candidate)
- **WBQA SEO** — lodge list page is nearly empty; PDT SEO work is important
- **convert-heic Edge Function** — uses `heic-to@1.4.2` (WASM, `npm:heic-to`); confirmed
  deployable in Supabase Edge Runtime. Triggered by GitHub Actions every 15 min via
  `.github/workflows/convert-heic.yml`; requires `SUPABASE_SERVICE_ROLE_KEY` in GitHub secrets
- **Supabase Edge Function secrets** — set separately from Netlify env vars via
  `supabase secrets set KEY=value`; not visible in Netlify dashboard
- **Drive DWD impersonation** — all Drive write operations impersonate `tech@pdtsingers.org`
  via domain-wide delegation. Applies to: `upload-photo.js`, `photo-proxy.js`,
  `curate-photo.js`, `drive-music-upload.js`. Service account acting as itself is insufficient
  — Drive files owned by president@ require DWD to write.
