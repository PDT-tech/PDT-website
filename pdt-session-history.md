# PDT Singers Website — Session History

**Archive of completed session logs.**
**Current state is in `pdt-session-context.md`.**
**Last entry: Session 17 — 2026-04-27**

---

## Session 17 — 2026-04-27

Session 17 (2026-04-27): Calendar/events bugs (#062–#070 batch), Member Home
redesign (Next Rehearsal removed, Sunburst card added, new block order), New
Event form save fix + time validation + label standardization, Photos page UX
fixes, nav/label cleanup across all 11 member pages, auth token lifetime
documented.

---

## Session 16 — 2026-04-26

- ✅ Photo feature design complete — all architecture decisions resolved
- ✅ pdt-photo-feature.md fully rewritten (Session 8 draft → Session 16 design-complete)
- ✅ Accepted upload formats: JPEG and HEIC only; all others rejected with clear error message
- ✅ HEIC conversion: post-process via pg_cron (15-min) + Supabase Edge Function; max JPEG quality; HEIC deleted after confirmed JPEG write; errors reported to tech@pdtsingers.org via Resend + surfaced in curation UI
- ✅ Filename de-confliction: EXIF datetime extracted server-side (exifr), prefixed to Drive filename; upload datetime fallback
- ✅ Upload UX: modal on members/photos.html; up to 8 files per operation; progress counter; event association via dropdown (last 90 days, not required); "General / No specific event" default
- ✅ All uploads private by default (is_public = false); admin/events_editor curates via inline toggle; "Make public" copies file to /Photos/Mainpage_Carousel/ in Drive
- ✅ Home page carousel: feeds from /Photos/Mainpage_Carousel/; random order client-side; logo placeholder on load, swaps in as Drive photos load; lazy-load next image
- ✅ Friends page carousel V1: replicates home page carousel; no auth gating; broader access deferred post-V1
- ✅ Member gallery: event-grouped fixed-aspect grid; lightbox with prev/next + single download; event picker (90-day default, expandable to all events with photos)
- ✅ Videos: deliberately deferred; rationale captured in pdt-tech-maintainers-guide.md §17
- ✅ Issue #059 added: Stripe donation page (future feature, no due date)
- ✅ §17 video deferral added to pdt-tech-maintainers-guide.md
- ✅ New env vars set in Netlify and env.local.js: GOOGLE_DRIVE_PHOTOS_FOLDER_ID, GOOGLE_DRIVE_CAROUSEL_FOLDER_ID
- ▶️ TODO: Write CC build prompts for photo feature implementation (next session)

---

## Session 14 — 2026-04-25

- ✅ Issue #057: `posts_blog_type_check` constraint fixed — `directors_notes` (underscore)
  was being rejected; constraint only had `directors-notes` (hyphen). Dropped and recreated
  with correct values: `directors_notes`, `poohbah`, `events`, `sunburst`. Chris Gabel now
  unblocked for Director's Notes posts.
- ✅ New Event form: "On stage" label → "On-stage at"; both perf-time fields aligned; time
  validation on blur (not on Save); browser native tooltip suppressed.
- ✅ Blog post modals: published/draft checkbox inverted — default is now published; checkbox
  now reads "Save as draft". All five blog files updated.
- ✅ "Poohbah's Prattlings" → "Poohbahs' Prattlings" (plural possessive) across all 11
  member pages and all occurrences in HTML.
- ✅ `members/comms.html` retired and deleted. Nav link removed from all member pages.
  Communications removed from Quick Links. "New Announcement" removed from Admin panel.
  Documented in `pdt-tech-maintainers-guide.md` under "Retired / Suppressed Pages".
- ✅ `members/resources.html` suppressed from nav (file retained). Documented in
  maintainers guide.
- ✅ Member Home dashboard card order: Next Rehearsal → Upcoming Events → Quick Links →
  Director's Notes → Poohbahs → Admin.
- ✅ Quick Links updated: Events, Calendar, Director's Notes, Music Library, Poohbahs'
  Prattlings (5 items; Communications removed).
- ✅ Public nav brand label: "Portland DayTime Singers" → "PDT Singers" on all 7 public pages.
- ✅ Public nav hamburger breakpoint raised 768px → 900px — prevents label stacking before
  hamburger activates.
- ✅ Member nav hamburger: dark mode contrast fixed; dropdown clipped-to-one-item bug fixed
  (height: auto; overflow: visible in 1100px media query).

---

## Session 13 — 2026-04-25

- ✅ Issue #032 (FWI-B): Admin attendance override complete.
  New page `members/admin-attendance.html`. Admin can enter attendance marks from
  clipboard for any event. Upserts to `event_attendance` table.
  Migration: `20260425120000_event_attendance_admin_insert.sql` — `attendance_insert_admin`
  policy on `event_attendance`.
  Edge Function: `notify-attendance-change` extended — `admin_override` flag splits changes
  into `adminChanges` (director email only, member name noted) vs `regularChanges`
  (existing behavior unchanged).
  Migration run in Supabase dashboard SQL editor. Edge Function deployed.

---

## Session 12 — 2026-04-25

- ✅ `pdt-conventions.md` auth method corrected — "magic-link-only" replaced with
  "6-digit email OTP" (via `verifyOtp`); re-uploaded to Project Memory
- ✅ Open items audit: photo feature, Sunburst on Friends page, Groups.io, WCAG audit,
  Facebook cross-posting, README rewrite, whats-new.html, second maintainer onboarding
  all confirmed as post-launch deferred items
- ✅ Moss Egli onboarding confirmed complete — Supabase account, events_editor role,
  Facebook group setup done
- ✅ Deceased member notification confirmed complete
- ✅ OTP settings confirmed: 6-digit code, 600s (10 min) expiry — both verified working

---

## Session 11 — 2026-04-24

- ✅ Issue #049: Attendance Save button grayed out on page load when no prior status saved.
  Fix: `startStatus = null` when no DB record; `isDirty()` returns true for null.
- ✅ Issue #050: Music Library page header block had no left margin — fixed.
- ✅ Issue #051: The Sunburst newsletter blog added to member portal — `members/sunburst.html`,
  `blog_type='sunburst'`, gold accent, admin-only posting, nav link added to all 11 member pages.
- ✅ OTP login implemented — `USE_MAGIC_LINKS = false`; magic link code preserved behind flag;
  OTP path: email → 6-digit code → `verifyOtp` → redirect.
- ✅ Issues #042–#048 logged.
- ✅ `pdt-decisions.md` updated — auth method entry superseded: OTP replaces magic link.
- ✅ `pdt-tech-maintainers-guide.md` updated — §10 rewritten for OTP, §7 updated with
  The Sunburst.
- ✅ CC batching principles documented in claude.ai memory.
- ✅ `posts_blog_type_check` constraint updated to include `sunburst`.
- ✅ OTP email template updated in Supabase dashboard.
- ✅ OTP expiry set to 600 seconds (10 minutes), 6-digit code length confirmed.

---

## Session 10 — 2026-04-23–24

- ✅ Issues #038–#041: Mobile hamburger bugs fixed (not opening, transparent dropdown,
  footer Member Portal link missing, dark mode hamburger icon invisible).
- ✅ Issue #034: New Event form max-width constraint.
- ✅ Issue #035: Cancel button color (invisible on form background) fixed.
- ✅ Issue #036: Additional time fields (call_time, on_stage) added to New Event form
  and DB via migration.
- ✅ Issue #045: Member portal page layout consistency — blog-header-inner max-width applied.

---

## Session 9 — 2026-04-21–22

- ✅ `investigate-before-you-design.md` pattern document created.
- ✅ Attendance page UI redesigned — two-cluster dropdown layout (sing-outs left,
  rehearsals right); dirty-state warning; batch save.
- ✅ Issues #031–#033 documented as deferred future work items (FWI-A, FWI-B, FWI-C).
- ✅ `pdt-decisions.md` updated with attendance UI redesign decision.
- ✅ Issue #017: Attendance batch save and notification pipeline implemented.

---

## Session 8 — 2026-04-20

- ✅ Issues #001, #018, #019, #020 resolved: portal exit link, booking inquiry form,
  Facebook CTA live URL, nav-brand not a link on index.html.
- ✅ Issue #012: `populate-rehearsals.js` — auto-populate Monday rehearsals.

---

## Session 7 — 2026-04-18–19

- ✅ Issue #016: Music Library 403 in production — root cause was direct Drive URLs
  bypassing the proxy; base64 approach hit 6MB Netlify ceiling (6.5MB MP3);
  final fix: Netlify Edge Function streaming (`drive-music-download.js`).
- ✅ `pdt-issues.md` created — issue tracker migrated from requirements doc; CC owns it.
- ✅ `pdt-decisions.md` created — 11 decisions sourced from chat history.
- ✅ `CLAUDE.md` created — CC standing instructions.
- ✅ Music Library streaming Edge Function decision documented.
- ✅ Google Workspace for Nonprofits approved and active via Goodstack (2026-04-18).
- ✅ Issue #002: New WebP logo assets from Mercedes Gibson deployed.

---

## Session 6 — 2026-04-17

- ✅ Issues #003–#011, #013: Public and member portal bug pass — headline break,
  calendar border, dark mode contrast, mobile WBQA logo, hamburger menu, footer links,
  button layout, portal footer wordmark, quick links, header underline.
- ✅ Member accounts seeded.

---

## Session 5 — 2026-04-15–16 (Magic Link → Workspace Drive)

- ✅ Auth switched back to magic link (Resend SMTP now live; Supabase SMTP replaced).
- ✅ Music Library migrated to Workspace Drive (president@pdtsingers.org).
  `GOOGLE_DRIVE_MUSIC_FOLDER_ID` updated in Netlify env vars.
- ✅ Issue #044: Member portal nav links right-aligned.
- ✅ Issue #043: Footer home link labels standardized across all 16 pages.
- ✅ Issue #046: Calendar cancellation → Events blog prompt.
- ✅ Issue #052: README.md fully rewritten.
- ✅ Issue #037: §15 MCP connectors section added to `pdt-tech-maintainers-guide.md`.
- ✅ Issue #055: Member portal nav "Home" → "Member Home" across all 10 pages.
- ✅ Issue #056: Member portal nav overflow fix — hamburger breakpoint raised to 1100px.
- ✅ Sunburst newsletter feature complete and live:
  - `members/sunburst.html` rewritten as Drive-backed PDF issue listing
  - `css/sunburst.css` created — warm palette tokens
  - `sunburst-issue-template.html` created — standalone print-to-PDF production tool
  - `netlify/functions/drive-music.js` extended with `sunburst-list` action
  - Google Drive Sunburst folder created, shared with service account
  - `GOOGLE_DRIVE_SUNBURST_FOLDER_ID` added to Netlify env vars
  - 401 fix: Open/Download buttons now use fetch→blob→synthetic anchor pattern
  - `pdt-conventions.md` updated with "Authenticated File Downloads" section
  - `pdt-decisions.md` updated with Sunburst architecture decision
- ✅ Issue #057: `posts_blog_type_check` constraint fixed — `directors_notes` underscore
  variant added.
- ✅ Issue #053: `posts` table: `event_id` column added (uuid, nullable, FK → events).
- ✅ Issue #054: `events_editor` removed from New Event button visibility (RLS mismatch).
- ✅ Issue #033 (FWI-C): Sing-out attendance census report — `renderReport()` rewritten;
  four-bucket layout; status-color-coded labels; reasons as indented secondary lines.

---

## Session 4 — 2026-04-15

- ✅ `members/comms.html` built and deployed (later retired Session 14).
- ✅ Music Library migrated to Workspace Drive (president@pdtsingers.org).
- ✅ Member portal consistency pass: directors-notes rebuilt, music.html nav fixed,
  "Home" link fixed, Resources dead link removed, Cloudflare email obfuscation fixed.
- ✅ Six public placeholder pages built and deployed.
- ✅ Public nav restructured to full 7-link structure.
- ✅ Resend account created, pdtsingers.org domain verified, wired into Supabase SMTP.
- ✅ `pdt-tech-maintainers-guide.md` built.

---

## Session 3 / 3 Addendum — 2026-03-30–31

- ✅ Music Library architecture decision: Netlify Function proxy + Google Drive service account.
  (Public link rejected: copyright liability. OAuth rejected: email mismatch, IT burden.
  Workspace emails for all members rejected: adoption failure in practice.)
- ✅ GCP project `pdt-singers-music-library` created.
- ✅ Service account `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com` created.
- ✅ Service account JSON key generated (original exposed in chat → rotated immediately).
- ✅ Drive API key created (`GOOGLE_DRIVE_API_KEY`).
- ✅ All 5 Netlify env vars set.
- ✅ `inject-env.js` updated to inject all 4 `window.__PDT_ENV` values.
- ✅ `netlify/functions/drive-music.js` built — serverless Drive proxy.
- ✅ `members/music.html` built — accordion Music Library with voice-part sorting,
  lazy file loading, My Tracks + Sheet Music download, Download All.
- ✅ `pdt-requirements.md` updated with Music Library architecture rationale (§5g).
- ✅ Nav logo oversized on music.html fixed.
- ✅ Lodge phone decoupled from website dependencies.

---

## Session 2 — 2026-03-29

- ✅ Hero redesigned — replaced SVG skyline with split-logo design.
- ✅ Dark mode added to `variables.css` + `main.css`.
- ✅ Netlify auto-publish disabled (always locked from this point).
- ✅ Auth switched from magic link to email + password (Supabase SMTP rate limit issue).
- ✅ Music Fairy test account created and verified.
- ✅ `env.local.js` local dev solution implemented.
- ✅ Modal overlay bug fixed (CSS class vs `hidden` attribute).
- ✅ Role visibility timing race fixed (`window.__PDT_USER` direct check pattern).
- ✅ Blog CSS fixes.
- ✅ Supabase posts RLS policies fixed and verified.
- ✅ Chorus calendar built (`members/calendar.html` + `css/calendar.css`).
- ✅ `generate-rehearsals` Edge Function deployed and verified.

---

## Session 1 — 2026-03-28

- ✅ Project goals, audiences, site structure, tech stack defined.
- ✅ `pdt-requirements.md` and `pdt-session-context.md` created.
- ✅ Placeholder site pushed to GitHub and deployed to Netlify.
- ✅ DNS propagation complete — pdtsingers.org live on Netlify.
- ✅ TechSoup registered — association code 4139-GERS-YP8U.
- ✅ Supabase project created, full DB schema deployed.
- ✅ Three blog pages built.
- ✅ Role model finalized.
- ✅ Palette and typography locked (Playfair Display + Source Serif 4).
