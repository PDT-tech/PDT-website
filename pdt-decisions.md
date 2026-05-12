# PDT Singers — Architecture & Design Decision Log
# Owned by Kevin + claude.ai. Updated in chat; re-uploaded to Project Memory when changed.
# CC never modifies this file.
# Last updated: 2026-05-04

---

## 2026-05-04 — Music Library: upload/delete via shared Edge Function

**Question:** How do Music Library admins create folders, upload files, and delete
files without logging into Drive directly?

**Decision:** Single new Netlify Edge Function (`netlify/edge-functions/drive-music-upload.js`
→ `/api/music-upload`) handles all three write actions: `create_folder`, `upload_file`,
`delete_file`. Role-gated to `musical_director` and `tech`. Service account promoted
from Viewer → Editor on the Music Drive folder.

**Key details:**
- Accepted formats: PDF and MP3 only (MIME-enforced server-side). 415 error message:
  "Only PDF and MP3 files are supported. Please select a supported file type and try again."
- Duplicate filenames: sequential suffix before extension (`-1`, `-2` … `-99`)
- Folder delete: deliberately excluded from V1 — Kevin handles in Drive directly
- UI: two admin buttons on `members/music.html` between title block and song count banner;
  trash icon per file row (inline confirm, no modal)
- Post-v1: add "Music Team" role to the gate when that role is created

**Rationale:** Same Edge Function for all write actions keeps auth/credential logic in
one place. Folder delete excluded because non-empty folder deletion via Drive API requires
recursive logic disproportionate to the volume of folder operations expected.

---

## 2026-05-02 — Drive upload: service account impersonation via domain-wide delegation

**Question:** Why do Drive uploads from the service account fail with a 403 storage quota error?

**Decision:** Service accounts have no storage quota of their own. Uploads must impersonate a Workspace user via domain-wide delegation. The `sub` claim in the service account JWT is set to `tech@pdtsingers.org`. Domain-wide delegation was enabled on the service account in GCP and authorized in Google Workspace Admin console (Security → API Controls → Domain-Wide Delegation) with scope `https://www.googleapis.com/auth/drive`.

**Rationale:** This is a Google-imposed limitation on service accounts. The fix is the pattern Google recommends for Workspace environments. Reads (Music Library, Sunburst, photo proxy) are unaffected — only writes (upload-photo.js) required this change.

**Applies to:** `netlify/edge-functions/upload-photo.js`, `photo-proxy.js`, `curate-photo.js`, `drive-music-upload.js`.

---

## 2026-03-28 — Tech stack: hosting and auth

**Question:** Where do we host the site, and what handles auth and member data?

**Decision:** Netlify (hosting) + Supabase (auth + database). Final — do not reopen.

**Rationale:** Evaluated LAMP/VPS alternatives (DigitalOcean, Hetzner, Neoserve). Rejected: unnecessary ops burden, no matching use case, free tier is genuinely sufficient for a small chorus. Netlify free tier covers hosting, CI/CD, Forms, and Functions. Supabase free tier covers auth, database, and RLS. Total cost: effectively $0 beyond domain registration (~$12/yr). Kevin has no interest in developing LAMP expertise.

---

## 2026-03-28 — Tech stack: no framework, hand-coded

**Question:** Should we use a JS framework (React, Vue, etc.) or a static site generator?

**Decision:** Hand-coded HTML5/CSS/vanilla JS. No framework, no build step. Final.

**Rationale:** Kevin's preference for full control. No plugin debt, no upgrade treadmill, no abstraction layer to debug. Appropriate for a site of this scale. Decap CMS was discussed early as an optional non-technical posting interface but is effectively superseded by the built-in Supabase post editor in the member portal — members log in, navigate to the blog page, and use the modal form. Same user experience Decap would have provided, already built. Decap is unlikely to ever be implemented.

---

## 2026-03-28 — Design: palette and typography locked

**Question:** What's the visual identity?

**Decision:** Palette from PDT logo watercolor wash — sky blues, cream, forest dark, gold. Fonts: Playfair Display + Source Serif 4 (Google Fonts). Locked — do not revisit without Kevin explicitly opening it.

**Rationale:** Derived directly from existing PDT brand assets. Consistent with chorus identity.

---

## 2026-03-29 — Auth method: magic link (with history)

**Question:** Email + password or magic link?

**Decision:** OTP (6-digit email code) only, as of Session 11 (2026-04-24). USE_MAGIC_LINKS = false in login.js. Magic link code preserved behind the flag — do not delete it. Do not reopen without Kevin explicitly requesting it.

**History:** Originally designed as magic link. Switched to email + password in Session 2 (2026-03-29) — Supabase built-in SMTP limited to 2 emails/hour, incompatible with personal email addresses. Switched back to magic link in Session 5 (2026-04-15) after Resend SMTP was wired in. Switched to OTP in Session 11 (2026-04-24) — magic links were breaking for at least one member (Sam Vigil) due to ISP link-mangling; OTP is more robust, has no email-client dependency, and avoids link expiry race conditions. shouldCreateUser: false preserved — only admin-created accounts can request a code.

---

## 2026-03-29 — Local dev credentials: env.local.js

**Question:** How do we inject Supabase credentials for local development without committing them?

**Decision:** `env.local.js` in repo root, gitignored. Sets `window.__PDT_ENV` with all four credentials. Production uses Netlify environment variables. Do not commit env.local.js under any circumstances.

**Rationale:** Cleanest zero-config local dev approach for a no-build-step site. Netlify edge function (`inject-env.js`) handles production injection; local file mirrors the same interface.

---

## 2026-03-29 — Role visibility: window.__PDT_USER pattern

**Question:** How do we show/hide UI elements based on member role?

**Decision:** Use `applyRoleVisibility()` checking `window.__PDT_USER` directly, with fallback to `pdt:profile-loaded` event.

**Rationale:** Relying solely on the `pdt:profile-loaded` event has a timing race — the event can fire before the listener is attached on fast connections. Direct check + event fallback is reliable. Pattern is documented in `pdt-conventions.md` and `CLAUDE.md`.

---

## 2026-03-29 — Modal overlays: CSS class not hidden attribute

**Question:** How do we show/hide modal dialogs?

**Decision:** Use `modal-hidden` CSS class. Never use the HTML `hidden` attribute on modals.

**Rationale:** The `hidden` attribute sets `display: none` which overrides `display: flex` in CSS. When `openModal()` removes `hidden`, the overlay renders with broken layout — the X button exists but receives no clicks. Discovered as a live bug in Session 2. `modal-hidden` class approach is reliable and consistent. Documented in `pdt-conventions.md` and `CLAUDE.md`.

---

## 2026-03-29 — Netlify auto-publish: always locked

**Question:** Should Netlify auto-deploy on every GitHub push?

**Decision:** Auto-publish is always locked. Manual deploy only — no frequency constraint.

**Rationale:** Preserve Netlify build credits (300/month free tier). Site is live on every deploy — no staging buffer — so content discipline matters. Unstaged changes before a deploy have caused build failures. Kevin unlocks, publishes, relocks in a single operation. Kevin deploys as often as needed during active work — multiple times per hour is normal when tuning a feature.

---

## 2026-03-30 — Music Library: Netlify Function proxy + Google Drive service account

**Question:** How do we serve licensed sheet music and learning tracks to members without exposing them publicly?

**Decision:** Netlify serverless function (`netlify/functions/drive-music.js`) authenticates to Google Drive via a service account. Members call the function (authenticated via Supabase session); function returns file listings from Drive. Members never interact with Google.

**Rationale:** Three alternatives were rejected:
- **"Anyone with link" public sharing:** Creates legal liability under copyright law for licensed music. Unacceptable.
- **OAuth / member Google login:** Members use ISP email (Comcast, Xfinity, etc.) — not Google accounts. Creates email mismatch between PDT account and Google identity. Ongoing IT burden inappropriate for a volunteer chorus.
- **Workspace accounts for all members:** Theoretically clean but fails in practice — members forget passwords, ignore new accounts, continue using personal email. Same mismatch and help desk problems.

Service account is invisible to members, secure, free tier, and requires no Google identity from anyone.

**Open issue:** A 403 error was observed in production on 2026-04-17 when attempting to download from the Music Library member page. Root cause not yet diagnosed — tracked in pdt-issues.md.

---

## 2026-04-15 — Agenda production: Word → PDF, not Google Docs

**Question:** Can we produce the High Council monthly agenda in Google Docs instead of Word?

**Decision:** No. Word → PDF is the correct pipeline for the High Council agenda. Do not attempt a Google Docs version.

**Rationale:** The agenda's visual design depends on paragraph-level borders (gold rules, left-border accents on officer blocks) and cell shading (cream welcome banner). Google Docs has almost no support for paragraph-level borders — they either don't render or render poorly. The Google Docs API has the same underlying limitations. The design features that give the agenda its character simply cannot be reproduced in Google Docs. Workaround if Google Docs editing is needed: produce the `.docx`, then upload to Google Drive for editing — import preserves most formatting reasonably well.

**Second pipeline — print-optimized HTML → Chromium → PDF:** For lighter documents (newsletters, reports, one-pagers) that don't require Word-specific formatting, a print-optimized HTML file opened in Chromium and printed to PDF is a fully acceptable and preferred alternative. Lower token cost than programmatic PDF generation; print quality is good. Kevin handles the manual Chromium print step. Use Word only when paragraph borders or shading are required by the design.

---

## 2026-04-18 — Issue tracking: pdt-issues.md owned by CC

**Question:** Where do we track open bugs and backlog items, and who maintains the list?

**Decision:** `pdt-issues.md` in the repo root, maintained exclusively by CC. Not uploaded to Project Memory. §13 removed from `pdt-requirements.md`.

**Rationale:** Keeping issues in the requirements doc required Kevin to manually download and re-upload the doc whenever the list changed — expensive in tokens and friction. GitHub Issues was evaluated but rejected: no GitHub MCP connector is available in the Claude registry for this environment, so claude.ai would still require a manual copy-paste step to read the list. `pdt-issues.md` gives CC sole ownership with a dead-simple flat format. Claude.ai reads it via `cat pdt-issues.md` when session planning requires it. CC updates it in the same commit as any code change that resolves an issue.

---

## 2026-04-18 — Decision log: pdt-decisions.md owned by Kevin + claude.ai

**Question:** How do we prevent relitigating settled architectural and design decisions?

**Decision:** `pdt-decisions.md` in the repo root, uploaded to Project Memory. Owned by Kevin and claude.ai — written in chat, re-uploaded to Project Memory when updated. CC never modifies it.

**Rationale:** Recurring cost of re-establishing settled decisions (e.g., Word vs. Google Docs agenda) is non-trivial. A searchable log with rationale short-circuits future re-investigation. Project Memory makes it available to claude.ai without manual paste. CC doesn't need write access — decisions are made in chat, not in code.

---

## 2026-04-18 — Music Library: download routing via Netlify Edge Function

**Question:** How do we serve large Drive files to authenticated members without
a size ceiling or token exposure?

**Decision:** Netlify Edge Function (`netlify/edge-functions/drive-music-download.js`)
as terminal handler on `/api/music-download`. Streams `driveRes.body` directly to
the browser — no buffering, no base64, no size ceiling. Service account token never
leaves the function. Declared before `inject-env` in `netlify.toml`. All client
download requests use the `fetch → blob → URL.createObjectURL → synthetic anchor`
pattern (documented in `pdt-conventions.md`). `drive-music.js` (Netlify Function)
handles folder and file listing only — no download logic.

**Rationale:** Initial fix used base64 encoding in a serverless function, which hit
Netlify's 6MB response ceiling immediately (6.5MB MP3 → 413). Google Drive has no
signed URL equivalent to GCS — a token-in-URL approach would expose the service
account token in browser history, server logs, and referrer headers. Edge Function
streaming eliminates both problems. GCS migration remains the cleaner long-term
architecture if Drive becomes a pain point.

**Applies to:** Music Library and The Sunburst newsletter (same Edge Function,
same pattern, different folder IDs).

---

## 2026-04-21 — Attendance page: two-cluster dropdown UI redesign

**Question:** How should the "Can You Be There?" attendance page present upcoming
events to members for attendance selection?

**Decision:** Replace the long scrolling per-event list with a two-cluster
dropdown layout. Sing-outs & Events cluster on the left (visual priority —
special events). Rehearsals cluster on the right (routine). Each cluster
contains: a dropdown of upcoming events (today or later, soonest selected by
default, ordered soonest-first); status radio buttons; an optional Reason text
field; and a Save button. A light-stroke rounded rectangle visually groups each
cluster. Dirty-state warning fires on page exit if unsaved changes exist.
Do not reopen the scrolling-list approach.

**Radio button states:**
- Sing-outs: three-way — "I'll be there" / "I'm not sure" / "I can't be there"
- Rehearsals: two-way — "I'll be there" / "I won't be there"
- "I'm not sure" is sing-out only; it does not appear in the rehearsal cluster

**Reason field behavior:**
- Shown and active when status is `not_attending` or `not_sure`
- Hidden (or disabled) when status is `attending`
- If a reason was previously saved for the selected event, it is pre-populated
  when that event is chosen from the dropdown
- Reason is optional — never required

**On event selection from dropdown:**
- Controls reload immediately with the member's previously saved state for
  that event (status + reason), or default to `attending` with empty reason
  if no prior record exists

**Dirty-state warning:**
- If member changes status or reason without saving and attempts to navigate
  away or select a different event from the dropdown, a browser confirm dialog
  warns: "You have unsaved changes — leave anyway?"

**Schema:** No changes required. `event_attendance` table already has
`status` (check constraint: `attending` | `not_sure` | `not_attending`),
`reason` (nullable text), and a unique constraint on `(event_id, member_id)`.
This is a UI rewrite only.

**Backing logic reuse:** The existing `attendance.js` segmentation
(`event_type = 'rehearsal'` vs. everything else), batch-save pattern, and
`notify-attendance-change` Edge Function call are retained unchanged.
Only the rendered DOM and event-handling wiring change.

**Rationale:** The original scrolling list became unwieldy as the rehearsal
schedule grew (weekly Mondays year-round). The dropdown pattern matches the
admin event-creation pattern already established in the calendar. Two clusters
give sing-outs visual prominence appropriate to their importance while keeping
rehearsal attendance accessible. Audience of 40–75 year olds on phones
influenced the dirty-state warning over auto-save — explicit Save gives members
a clear confirmation moment.

---

## 2026-04-21 — Future work item documentation standard

**Question:** How do we capture context for deferred work items so we can restart
efficiently without token-expensive reconstruction?

**Decision:** When a future work item is identified during design or investigation,
capture it immediately in `pdt-issues.md` as an OPEN item with full restart
context — schema state, as-built function names, what exists vs. what is
greenfield, RLS requirements, and any decisions already made. The goal is that
a future session can read the issue entry and begin coding without any
investigation phase. Do not defer documentation to "later in the session" —
write it before moving to the next topic.

**Rationale:** Reconstructing context in a new session is expensive in tokens,
time, and introduces risk of conflicting decisions. A single well-written issue
entry costs less than five minutes of the session that creates it and saves
30+ minutes (and significant token cost) in the session that implements it.
This pattern is especially important for items with non-obvious schema
dependencies or partially-built backing logic.

---

## 2026-04-25 — The Sunburst: Drive-backed PDF listing, no new storage

**Question:** How do we store and serve Ray Heller's PDF newsletter to members?

**Decision:** Google Drive `Sunburst` folder under president@pdtsingers.org,
served via the existing service account proxy. No new storage service.

**Details:**
- Folder shared with service account (Viewer) — same pattern as Music Library
- Listing: new `sunburst-list` action in `netlify/functions/drive-music.js`
- Downloads: existing `netlify/edge-functions/drive-music-download.js` —
  no changes needed
- File naming convention: `YYYY-MM-DD — Title.pdf` (em dash U+2014, spaces
  around it) — filename is the sole metadata source, no sidecar files
- Auth pattern: fetch → blob → URL.createObjectURL → synthetic anchor.
  window.open() and `<a download>` rejected — cannot carry Authorization
  headers to the Edge Function (returns 401). Documented in pdt-conventions.md.
- Mobile UX: Open button opens PDF in new tab (OS native viewer). iframe
  rejected — iOS Safari doesn't render PDFs in iframes reliably.
- Newsletter production pipeline: Ray sends .docx → Kevin converts using
  sunburst-issue-template.html → Chromium print-to-PDF → rename to
  convention → upload to Drive. Page auto-reflects on next load, no deploy.

**Env var:** `GOOGLE_DRIVE_SUNBURST_FOLDER_ID`  
**Folder ID:** [REDACTED — real value in Netlify env vars as GOOGLE_DRIVE_SUNBURST_FOLDER_ID]

---

## 2026-04-26 — Photo storage architecture

**Question:** Where do member-uploaded photos live, and what is the source of truth for organization?

**Decision:** Google Workspace Drive `/Photos/` flat folder for file storage. `photo_uploads` Supabase table as metadata source of truth (uploader, event association, EXIF datetime, conversion status, public flag). Same service account and proxy pattern as Music Library. Two subfolders: `/Photos/` (all uploads) and `/Photos/Mainpage_Carousel/` (curated public subset).

**Rationale:** Reuses infrastructure already built and proven for the Music Library. No new accounts, no new GCP projects, no new proxy patterns. Drive is blob storage; Supabase owns the organization logic.

---

## 2026-04-26 — Photo upload format restriction

**Question:** Which file formats does the photo upload system accept?

**Decision:** JPEG and HEIC only. All other formats rejected at upload time with a clear error message. No exceptions in V1.

**Rationale:** JPEG is the Android camera default and universal browser format. HEIC is the iPhone camera default. Together they cover >95% of real-world phone uploads. Excluding PNG, WebP, RAW, and DNG keeps the upload pipeline simple and avoids encouraging large files.

---

## 2026-04-26 — HEIC conversion: post-process, max quality

**Question:** How and when are HEIC files converted to browser-displayable JPEG?

**Decision:** Post-process only — upload stores HEIC as-is, conversion happens via GCP Cloud Scheduler (free tier, existing GCP project `pdt-singers-music-library`) calling a Supabase Edge Function every 15 minutes. Max JPEG quality (quality=100). HEIC deleted from Drive after confirmed JPEG write. Errors reported to tech@pdtsingers.org via Resend and surfaced inline in the curation UI via `conversion_status = 'failed'` rows.

**Rationale:** Keeping conversion out of the upload path keeps upload UX fast. Uploading is already friction for members on phones — adding a blocking server-side codec step would make it worse. Post-process is invisible to the uploader and recoverable on failure.

---

## 2026-04-26 — Video upload deliberately deferred

**Question:** Should the photo system also accept video uploads?

**Decision:** No. Video upload is explicitly out of scope for V1. Members wanting to share video contact Kevin for manual upload. Revisit if member demand is clear and sustained.

**Rationale:** Videos introduce file size, transcoding, format fragmentation, and playback complexity that photos don't have. Low near-term demand. Rationale and open questions for a future video feature are documented in pdt-tech-maintainers-guide.md §17.

---

## 2026-04-26 — Stripe donation page: future feature

**Question:** Should PDT add a member portal donation page powered by Stripe?

**Decision:** Yes, eventually. Logged as issue #059. No due date, no design yet. Features when built: donation form, Stripe payment processing, automatic deposit to OnPoint Credit Union operating account, 501(c)(3) tax receipt email to donor via Resend.

**Rationale:** PDT is a confirmed 501(c)(3). Donation capability is a natural fit. Deferred because photo system and public page polish are higher priority.

---

## 2026-04-26 — HEIC conversion: heic-to library

**Question:** What library implements HEIC→JPEG conversion in the Supabase Edge Function?

**Decision:** `heic-to (npm:heic-to@1.4.2)` — WASM-based HEIC decoder built on libheif via
Emscripten. Replaces the originally specced "sharp with libheif" and the incorrectly named
`@jsquash/heic` (which does not exist on npm). heic-to confirmed deployable in Supabase Edge
Runtime. Quality parameter is 0–1 scale; quality: 1 = maximum quality.

**Rationale:** Supabase Edge Functions run on Deno, which cannot load native Node.js addons.
`sharp` relies on `libvips` native bindings and is incompatible with the Supabase Edge runtime.
heic-to uses WASM exclusively — no native binaries — and is deployable via npm: specifiers.
Behavioral spec is unchanged: max-quality JPEG, same post-process pipeline.
