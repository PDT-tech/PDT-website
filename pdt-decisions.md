# PDT Singers — Architecture & Design Decision Log
# Owned by Kevin + claude.ai. Updated in chat; re-uploaded to Project Memory when changed.
# CC never modifies this file.
# Last updated: 2026-04-18

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

**Decision:** Magic link only (as of Session 5, 2026-04-15). Do not reopen.

**History:** Originally designed as magic link. Switched to email + password in Session 2 (2026-03-29) because Supabase's built-in SMTP only allows 2 emails/hour to non-domain addresses — incompatible with a membership using personal email (Gmail, Comcast, etc.). Switched back to magic link in Session 5 after Resend SMTP was wired into Supabase, eliminating the rate limit. `shouldCreateUser: false` ensures only admin-created accounts can receive magic links.

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

## 2026-04-18 — Music Library: all Drive access proxied through Netlify Function

**Question:** Can file download URLs point directly to Google Drive?

**Decision:** No. All Drive interactions — folder listing, file listing, and file
download — must go through `netlify/functions/drive-music.js`. Direct
`drive.google.com` URLs are never used in client code.

**Rationale:** Direct Drive URLs bypass the service account token entirely.
Google rejects unauthenticated requests with 403. Discovered in production
2026-04-18 when `dlUrl()` in `music.html` was building direct `drive.google.com`
download URLs while the listing calls correctly proxied through the function.
Fix: added `type=download` endpoint to `drive-music.js` that fetches file content
server-side using the service account token and returns it base64-encoded.
`validateSession()` added to all three endpoints — unauthenticated requests
return 401. Client updated to route all downloads through `proxyDownload()` with
Bearer token auth. Known constraint: Netlify Functions have a 6MB response limit
(~4.5MB file ceiling before base64 expansion) — monitor when Music Library is
populated from Dropbox.

**Superseded 2026-04-18:** The base64 approach hit the 6MB ceiling immediately
in practice (6.5MB MP3 confirmed 413 in Netlify logs). Download handling moved
to a Netlify Edge Function (`netlify/edge-functions/drive-music-download.js`)
that streams `driveRes.body` directly to the browser — no buffering, no size
ceiling, service account token stays server-side. `drive-music.js` now handles
folder and file listing only. Edge Function declared before `inject-env` in
`netlify.toml` so inject-env never runs on `/api/music-download` requests.
