# PDT Singers Website — Session Context

**Project:** PDT Singers website build  
**Last updated:** 2026-04-17 (Session 7)  
**Requirements doc:** `pdt-requirements.md`  
**Site Brief source:** `PDT_Singers_Site_Brief.md` (March 2026)

---

## How to Use This Document

Paste the **Project Summary** section below into any new Claude session to resume
work without re-explaining the project. Update the Session History and Open Questions
sections at the end of each session.

---

## Project Summary ← paste this into any new session

We are hand-coding a website for **Portland DayTime Singers (PDT Singers)**, a men's
barbershop-style chorus in Portland, Oregon that performs free concerts for seniors in
care facilities and recruits male singers. PDT Singers is **Lodge #18 of the Worldwide
Barbershop Quartet Association (WBQA)**, co-founded by director **Chris Gabel** and
**Kevin Bier** (Grand Poohbah). NOT affiliated with BHS — state clearly on About page.

**Domain:** pdtsingers.org (helpinghosting.com). Current placeholder at GreenGeeks to
be retired at DNS cutover when new site launches.

**Tech stack:**
- Hand-coded HTML5 / CSS3 / vanilla JS — no frameworks, no WordPress
- Hosted on **Netlify** (free tier) — GitHub CI/CD deploy
- Auth via **Supabase** (email + password, admin controls access via is_active flag, member content storage)
- Forms via **Netlify Forms**
- **Netlify Functions** (serverless) — Drive proxy for Music Library
- Source control on **GitHub**: https://github.com/kevin36v/PDT-website
- Email via **Google Workspace for Nonprofits** (TechSoup verification pending)
- Optional: **Decap CMS** for non-technical blog posting (Phase 3+)

**Owner/maintainer:** Kevin Bier — experienced software/product exec (C++, 25+ yrs
product leadership at HP/Microsoft/Nike), light on DB and web coding, fully capable of
technical lifting with guidance.

**Design:** Palette from PDT logo watercolor wash (sky blues + cream + forest dark +
gold). Fonts: Playfair Display + Source Serif 4. Tone: warm, community-focused,
first-person plural. Tagline: "Music, Fellowship & Fun."

**Current phase:** Phase 2 active — all public pages live with real content. Member accounts seeded. Password auth setup pending.

---

## Phases & Milestones

### Phase 0 — Foundation ✅ Complete
- [x] Define goals, audience, site structure
- [x] Choose tech stack
- [x] Create pdt-requirements.md and pdt-session-context.md
- [x] Review and incorporate PDT_Singers_Site_Brief.md
- [x] Review WBQA website (sppbsqsus.org)
- [x] Review homepage comp (PDT_Singers_Homepage_Comp.html)
- [x] Resolve director name spelling (Chris Gabel ✓)
- [x] Confirm all logos in hand
- [x] Get GitHub repo URL — https://github.com/kevin36v/PDT-website

### Phase 1 — Foundation / Scaffolding (current)
- [x] Kevin creates GitHub repo
- [x] Scaffold full file/folder structure in repo
- [x] Set up Netlify project, connect to GitHub repo
- [x] Configure custom domain (pdtsingers.org → Netlify) ✅ DNS cutover complete
- [x] GreenGeeks decommission — Trevor notified ✅
- [x] Create base HTML template (head, nav, footer, meta)
- [x] Create base CSS (variables, reset, typography, layout)
- [x] Deploy skeleton site — placeholder live and looking great ✅
- [x] Apply for Google Workspace for Nonprofits — TechSoup registered (4139-GERS-YP8U), awaiting verification
- [x] Set up Supabase project (Americas region) ✅
- [x] Deploy DB schema: profiles, events, absences + RLS policies ✅
- [x] Auto-profile trigger on auth.users insert ✅
- [x] Netlify env vars: SUPABASE_URL, SUPABASE_ANON_KEY ✅
- [x] Write pdt-calendar-spec.md ✅
- [x] Build member auth flow (login page, Supabase JS client, auth-guard) ✅
- [x] Build member dashboard (members/index.html) ✅
- [x] Build Director's Notes blog (members/directors-notes.html) ✅
- [x] Build Grand Poohbah's Prattlings blog (members/poohbah.html) ✅
- [x] Build Events blog (members/events.html) ✅
- [x] Build blog CSS (css/blog.css) ✅
- [x] posts table + RLS policies deployed to Supabase ✅
- [x] Switch auth from magic link to email + password ✅
- [x] Music Fairy test account — full CRUD on events blog verified ✅
- [x] env.local.js local dev solution — Supabase creds injected locally, gitignored ✅
- [x] Netlify auto-publish disabled — manual deploy only, credits preserved ✅
- [x] Build member calendar (members/calendar.html) ✅
- [x] Build Music Library (members/music.html) ✅
- [x] Build Drive proxy Netlify Function (netlify/functions/drive-music.js) ✅
- [x] Update inject-env.js with Google Drive env vars ✅
- [x] Set up Google Drive + service account for Music Library ✅
- [x] Fix nav logo oversized on music.html — added `.nav-logo img` height constraint to main.css ✅
- [ ] Fix env.local.js console error in production (nosniff header blocking onerror suppression)
- [x] Build Communications page (members/comms.html) ✅
- [x] Redesign login.html — magic link only, remove password auth ✅ (Session 5)
- [ ] Test magic link end-to-end with a real member email
- [ ] Disable password auth in Supabase dashboard (once magic link confirmed)
- [ ] Cap OTP expiry at 15 minutes (Supabase → Authentication → Settings → OTP Expiry; currently 24h)
- [x] Build Home page (copy updates pending from group)
- [x] Build About Us page (placeholder) ✅
- [x] Build Join Us page (placeholder) ✅

### Phase 2 — Public Site Complete
- [x] Build Performances page — placeholder live ✅
- [x] Build Our Music page — placeholder live ✅
- [x] Build Friends of PDT page — placeholder live ✅
- [x] Build Contact page — placeholder live ✅
- [ ] Upload group photos
- [x] Finalize all public copy — All public pages have real content ✅
- [ ] SEO: meta tags, XML sitemap, Google Search Console

### Phase 3 — Polish & Launch
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing
- [ ] Final content review
- [ ] Populate Drive Music folders with files from Dropbox
- [x] DNS cutover: pdtsingers.org → Netlify ✅ Complete
- [x] GreenGeeks retired — Trevor notified ✅

### Phase 4 — Post-Launch
- [ ] Google Workspace for Nonprofits activation — TechSoup verification pending (4139-GERS-YP8U)
- [ ] Migrate Music Library Drive share to Workspace Drive (no code changes needed)
- [ ] Social media accounts live → update Friends page links
- [ ] Onboard second site maintainer
- [ ] Document update procedures (blog post, add member, update schedule)
- [ ] Update TechSoup account email to @pdtsingers.org once Google Workspace is live
- [ ] **Onboard Moss Egli as Social Media Manager** — create Supabase account, determine role (events_editor to start, may need dedicated social_media_manager role — TBD)
- [ ] **Cross-posting feature**: post PDT events/announcements to Facebook Events and newsletters from website — requirements TBD with Moss
- [ ] **members/whats-new.html** — simple static changelog page for members; hand-maintained; lists website functionality changes (not content)
- [ ] **About Us highlight for Moss Egli** — add SMM bio/blurb to About Us page
- [ ] Notify deceased member's son to deactivate old site
- [ ] Cap OTP expiry at 15 minutes (Supabase → Authentication → Settings → OTP Expiry)
- [ ] Disable password auth in Supabase dashboard
- [ ] Test magic link end-to-end with a real member email
- [ ] Add HTML doc style convention: keep both .md and .html versions of major doc files

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-28 | Hand-coded HTML/CSS/JS, no framework | Owner preference, full control, no plugin debt |
| 2026-03-28 | Netlify for hosting | Free tier, GitHub integration, Forms included |
| 2026-03-28 | Supabase for auth & member content | Admin approval flow, magic link, DB storage |
| 2026-03-28 | Netlify Forms for public forms | No backend needed, free tier sufficient |
| 2026-03-28 | Decap CMS optional (Phase 3+) | Non-technical blog posting option |
| 2026-03-28 | Palette locked from comp | Sky blues + cream + forest + gold from PDT logo watercolor wash |
| 2026-03-28 | Fonts: Playfair Display + Source Serif 4 | Georgia/Arial in comp; upgrade to Google Fonts in build |
| 2026-03-28 | SVG skyline as hero illustration | Mirrors PDT logo; no photo dependency at launch |
| 2026-03-28 | Netlify + Supabase confirmed as final hosting/auth stack | Evaluated LAMP/VPS — rejected: unnecessary ops burden. Decision is final. |
| 2026-03-28 | BHS non-affiliation stated on About page | Visitors may assume BHS connection; important to clarify |
| 2026-03-29 | Switched from magic link to email + password | Supabase free tier: 2 magic link emails/month to non-domain addresses — incompatible with member base using personal email |
| 2026-03-29 | Hero redesigned: split logo (words top + cityscape bottom) | Logo anchors hero; mix-blend-mode handles white-background PNGs |
| 2026-03-29 | Netlify auto-publish disabled | Preserve 300 credits/month; manual deploy only when phase complete |
| 2026-03-29 | env.local.js for local dev credentials | Gitignored; Supabase creds injected at runtime; production uses Netlify env vars |
| 2026-03-29 | role-visibility via window.__PDT_USER check | pdt:profile-loaded event has timing race; direct check + fallback is reliable |
| 2026-03-30 | Music Library: Netlify Function proxy + Google Drive service account | See pdt-requirements.md §5g for full rationale. Short version: "Anyone with link" exposes licensed music (legal liability); OAuth requires Google accounts members don't have or won't use; service account proxy is invisible to members, secure, and within free tier limits |
| 2026-03-30 | No Supabase songs table | Google Drive folder list is source of truth; adding a song = add a folder in Drive |
| 2026-03-30 | Music Library local dev uses API key + direct Drive calls | Service account JWT signing requires Node.js crypto — not available in browser; Netlify function handles production; local dev temporarily requires "Anyone with link" on Music folder |
| 2026-03-30 | Lodge phone decoupled from website dependencies | Kevin has iPhone 11 + Mint Mobile path; can proceed independently of website timeline |
| 2026-04-15 | Switched auth back to magic link (Resend SMTP) | Resend provides reliable transactional email; pdtsingers.org domain verified; Supabase SMTP wired in. Simpler UX — members never manage passwords. Password auth to be disabled once magic link confirmed. |
| 2026-04-15 | Music Library migrated to Workspace Drive | president@pdtsingers.org is now the Drive owner; folder ID updated in Netlify env vars. Service account and proxy unchanged. |
| 2026-04-17 | Legend removed from calendar header | Calendar not busy enough to justify visual complexity; chip colors remain as subtle cues |
| 2026-04-17 | Calendar detail panel → modal card | Sidebar was clunky on desktop and worse on mobile; modal with smart positioning works across all sizes |

---

## Open Questions

- [x] Domain: pdtsingers.org at helpinghosting.com; GreenGeeks placeholder to be retired
- [x] Director name: **Chris Gabel** (German spelling — "Gable" was the typo)
- [x] Voice parts: TTBB barbershop chorus
- [x] Logos: raster versions in hand; vectorized + "words only" pending (Mercedes Gibson → Grant → Kevin)
- [x] Rehearsal details confirmed
- [x] Charter: Lodge #18, WBQA Convention 2026, San Antonio TX (reissue pending)
- [x] Group photos: available
- [x] Social media: website first; Facebook deferred
- [x] Tagline: "Music, Fellowship & Fun"
- [x] Performance fee: $150 standard; free for mission-aligned
- [x] **GitHub repo: https://github.com/kevin36v/PDT-website**
- [x] IRS 501(c)(3) letter: **in hand** — Google Workspace now unblocked
- [x] Music Library architecture: Netlify Function + service account (see requirements §5g)
- [x] Lodge phone: decoupled — Kevin has iPhone 11 + Mint Mobile, proceed independently
- [ ] **Moss Egli onboarding** — Supabase account + role TBD; first task: set up PDT Facebook group
- [ ] **Cross-posting requirements** — Moss to drive; Facebook Events + newsletter integration
- [ ] **members/whats-new.html** — post-launch changelog page for members
- [ ] **Moss highlight on About Us** — SMM bio TBD
- [ ] Desired email addresses?
- [ ] Second site maintainer?
- [ ] Member Blog: comments or read-only?
- [ ] Duane Lundsten memorial form/placement (group discussion pending)
- [ ] Grant's prioritized landing page elements (input pending)
- [ ] Vectorized logo files (pending from Mercedes Gibson)
- [ ] Groups.io for Friends of PDT (tabled until Google Workspace live)
- [ ] Music Library local dev testing — temporarily set Music folder to "Anyone with link",
      test, then revert. Don't forget to revert.

---

## File/Folder Structure (planned)

```
pdtsingers/                  ← repo root
├── index.html               ← Home
├── about.html
├── music.html
├── performances.html
├── join.html
├── friends.html
├── contact.html
├── login.html
├── 404.html
├── members/
│   ├── index.html              ← Member dashboard (Supabase-gated)
│   ├── directors-notes.html    ← Blog — Chris Gabel
│   ├── poohbah.html            ← Blog — Kevin Bier ("Prattling from the Grand Poohbah")
│   ├── events.html             ← Events blog (performances, sing-outs, socials)
│   ├── comms.html              ← Communications / announcements
│   ├── calendar.html           ← Chorus calendar + absence tracking
│   ├── music.html              ← Music Library (Drive proxy via Netlify Function)
│   └── resources.html          ← Additional resources
├── netlify/
│   ├── edge-functions/
│   │   └── inject-env.js       ← Injects all env vars into HTML at runtime
│   └── functions/
│       └── drive-music.js      ← Drive proxy: authenticates via service account
├── css/
│   ├── reset.css
│   ├── variables.css
│   └── main.css
├── js/
│   ├── supabase.js
│   ├── members.js
│   └── main.js
├── assets/
│   └── images/
│       ├── PDT_logo_bw.png
│       ├── PDT_logo_color_1.jpeg
│       ├── PDT_logo_color_2.jpeg
│       └── WBQA_logo.png
├── netlify.toml
├── env.local.js              ← gitignored; local dev credentials
├── pdt-singers-music-library-*.json  ← gitignored; service account key
└── README.md
```

---

## Key Reference Data

**Rehearsals:** Mondays 10:30am–12:30pm  
**Location:** 13420 SW Butner Rd, Beaverton OR 97005 (Westside United Methodist / Westside Journey UMC)  
**Voice placement:** Sing Happy Birthday in comfortable range — not an audition  
**First performance:** February 2026 at The Social Kitchen, Vancouver WA (2/6/2026)  
**Performance fee:** $150 standard 40-min performance; free for philanthropic/mission/recruitment  
**Current repertoire:** 8 songs (God Bless America just added); 3 additional rehearsal-only songs in Drive  
**WBQA:** sppbsqsus.org / facebook.com/WBQA.Sings  
**Charter:** Lodge #18, WBQA Annual Convention, San Antonio TX, March 14, 2026  
**GitHub repo:** https://github.com/kevin36v/PDT-website  
**Netlify project:** astonishing-douhua-7cfbb7.netlify.app  
**pdtsingers.org:** ✅ Live on Netlify — DNS cutover complete  
**Financials:** Banking at OnPoint Credit Union; $565 raised to date; 501(c)(3) confirmed  
**Sheet music:** Kevin's Google Drive `.PDT/Music/` — served via Netlify Function + service account  
**Music folder ID:** see `GOOGLE_DRIVE_MUSIC_FOLDER_ID` Netlify env var (Workspace Drive, president@pdtsingers.org — updated Session 4)  
**GCP project:** `pdt-singers-music-library`  
**Service account:** `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`  
**Service account key:** gitignored JSON file in repo root; also stored as `GOOGLE_SERVICE_ACCOUNT_JSON` in Netlify  
**Lodge phone:** TBD — Kevin has iPhone 11 to donate; Mint Mobile ~$180/yr; decoupled from website  
**TechSoup:** ✅ Registered — Association code **4139-GERS-YP8U** — awaiting verification  
⚠️ **Reminder: Update TechSoup account email to @pdtsingers.org once Google Workspace is live**

---

## Netlify Environment Variables (all 5 set)

| Key | What it is |
|-----|-----------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `GOOGLE_DRIVE_API_KEY` | Drive API key (used for local dev direct calls) |
| `GOOGLE_DRIVE_MUSIC_FOLDER_ID` | ID of the Music folder in Drive |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON (secret); used by Netlify Function in production |

---

## Notes & Gotchas

- PDT Singers is **NOT BHS** — must be stated on About page; some visitors will assume BHS affiliation
- **Three member blogs**: Director's Notes (musical_director + admin), Prattling from the Grand Poohbah (admin only), Events blog (events_editor + admin)
- **Roles**: admin (Kevin), musical_director (Chris), events_editor (social media mgr/Wives Auxiliary/etc.), calendar_manager, member
- **Music Library**: Drive is source of truth — no Supabase songs table. Production calls Netlify Function which uses service account JWT auth. Local dev calls Drive API directly with API key (requires Music folder temporarily set to "Anyone with link" — don't forget to revert).
- **Service account key security**: original key was exposed in chat during Session 3 and immediately rotated. New key is in repo root (gitignored) and in Netlify env vars.
- **inject-env.js**: now injects all 4 PDT env vars (Supabase + Drive). Edge function is safe to commit — no hardcoded values.
- Duane Lundsten (Poohbah of Complex Stuff) passed March 2026 — memorial placeholder in design; no action before Phase 1
- WBQA lodge list page is nearly empty — no central directory driving traffic to lodge sites; PDT SEO work is important
- Supabase free tier is generous but has a 1-week inactivity pause policy — member activity should prevent this
- Netlify Forms free tier: 100 submissions/month — more than sufficient for this site
- Netlify Functions free tier: 125k invocations/month — Music Library uses ~30/day max
- Google Workspace nonprofit application takes 2–4 weeks via TechSoup after IRS letter in hand
- Director's name is **Gabel** (German spelling) — confirmed by Kevin. Earlier comp had "Gable" which was the typo.
- **Local dev**: `cd ~/PDT-website && python3 -m http.server 8080` — keep browser dev tools open with cache disabled
- **env.local.js**: gitignored local file that sets window.__PDT_ENV with all 4 credentials. Must be present in repo root for local dev. Never commit.
- **Role visibility pattern**: use `applyRoleVisibility()` checking `window.__PDT_USER` directly, falling back to `pdt:profile-loaded` event — direct event listener alone has a timing race condition
- **Supabase posts RLS policies**: insert/update/delete are role+blog_type scoped; select has two policies — `posts_select_authenticated` (published only, all members) + `posts_select_admin` (all posts, admin only) + `posts_select_author` (own posts, any role)
- **Auth is magic-link-only** (Session 5) — Resend SMTP wired in, login.html redesigned. Password auth still exists in Supabase but is unused; disable once magic link confirmed in production.
- **pdtsingers.music@gmail.com**: created as staging account but not used — Music files live in Kevin's personal Drive. May dispose of this account.
- PDT performs **sing-outs** — not concerts. Use "sing-outs" consistently throughout the site.
- **Voice parts are capitalized** when referenced by name: Tenor, Lead, Baritone, Bass.
- Avoid "care facilities" — use "senior centers, independent and assisted living communities" instead.
- **Supabase Project URL:** see SUPABASE_URL Netlify env var
- **Member accounts seeded April 16, 2026.** Passwords not yet set — needed before login announcement sent.
- **seed-members.mjs** in repo root — one-time script, not a site file. node_modules/ is gitignored.
- profiles table columns: id, full_name, role, voice_part, is_active, created_at, updated_at
- Grant Gibson role: admin
- Moss Egli role: events_editor (moss.egli2006@gmail.com)
- posts_delete_by_role: now scoped per blog_type, consistent with insert/update

---

## Session History

### Session 7 — 2026-04-17

- ✅ Confirmed auth is magic-link only — no passwords needed for member accounts
- ✅ Moss Egli onboarded — Supabase account created, role = events_editor
- ✅ posts_delete_by_role policy tightened — events_editor and musical_director
  now scoped to their own blog_type on DELETE, consistent with INSERT/UPDATE
- ✅ Grant Gibson promoted to admin role
- ✅ Member announcement email sent
- ✅ Magic link email template updated: "24 hours" → "15 minutes"; greeting fixed
- ✅ New member onboarding procedure added to pdt-tech-maintainers-guide.md/.html
  (fixed display_name → full_name bug in same session)
- ✅ Poohbah blog renamed: "Grand Poohbah's Prattlings" → "Poohbah's Prattlings"
  across all 7 member pages + dashboard card
- ✅ Calendar UX rework:
  - modal-hidden fix (blog.css rule not loaded on calendar page)
  - Page hero added: "Chorus Calendar" h1 + usage blurb
  - Sidebar detail panel removed; replaced with smart-positioned modal card
  - Hover popover added (desktop only, 1.5s delay)
  - New Event button moved to toolbar below grid
  - Legend removed from header
  - Month nav centered; Today button restyled as legible pill, centered below nav
  - Header border softened to 1px rgba
- ✅ Photo upload/gallery feature spec written: pdt-photo-feature.md
- ▶️ TODO: Deploy calendar changes (pending final commit)
- ▶️ TODO: Test calendar modal and hover popover in production
- ▶️ TODO: Photo upload/gallery feature — see pdt-photo-feature.md

### Session 6 — 2026-04-16

- ✅ Netlify deploy confirmed clean after secret fix (GOOGLE_DRIVE_MUSIC_FOLDER_ID removed from docs)
- ✅ Added synthetic placeholder rule to pdt-conventions.md (Secrets section)
- ✅ Added commit-and-push reminder rule to pdt-conventions.md (root cause of repeated build failures)
- ✅ Seeded all 15 member accounts via Node.js script (seed-members.mjs) — roles and voice parts set
- ✅ node_modules/ added to .gitignore
- ✅ OTP expiry set to 900 seconds (Supabase → Sign In / Providers → Email)
- ✅ Password auth effectively disabled (not wired to any UI)
- ✅ Button default state bug fixed globally — dark-mode --sky override was root cause
- ✅ Buttons & CTAs convention added to pdt-conventions.md with documented exceptions
- ✅ About Us page built and deployed with real content
- ✅ Join Us page built, then substantially revised — rebalanced from "no barriers" to "welcoming but serious"
- ✅ Performances page built with three upcoming sing-outs
- ✅ Our Music page built with video embed placeholder
- ✅ Friends of PDT page built with newsletter placeholder
- ✅ Home page (index.html) updated — hero subhead, terminology fixes, performances teaser, Join CTA added
- ✅ "care facilities" and "concerts" terminology purged from all public pages
- ✅ Voice parts capitalized (Tenor, Lead, Baritone, Bass) throughout
- ✅ "How it started" subhead fix on About Us Our Story section
- ✅ Hero heading updated to "Men who love to sing — and bring that joy to their community"
- ✅ Supabase Project URL identified: see SUPABASE_URL Netlify env var
- ▶️ TODO: Set passwords for all member accounts — needed before member announcement email can be sent
- ▶️ TODO: Send member announcement email (draft ready, password instructions placeholder)
- ▶️ TODO: Onboard Moss Egli — Supabase account + events_editor role
- ▶️ TODO: Add new member onboarding procedure to pdt-tech-maintainers-guide.md
- ▶️ TODO: Mobile layout audit
- ▶️ TODO: SEO pass (after mobile audit and content settled)
- ▶️ TODO: Style guide — defer to Phase 2 wrap-up
- ▶️ TODO: Duane Lundsten remembrance on About Us — pending group discussion
- ▶️ TODO: Photo archive section on Performances page
- ▶️ TODO: Hero heading alternatives — poll HC via email (3 options documented in session)
- ▶️ TODO: Google Workspace — waiting on Goodstack/TechSoup

**Hero heading alternatives under HC review:**
1. "Men who love to sing — and share it with their community" (current)
2. "Men who love to sing — and bring that joy to others"
3. "Men who love to sing — for the love of harmony and the good of the community"

### Session 5 — 2026-04-15

- ✅ **Magic link login complete** — login.html redesigned to magic-link-only flow:
  - Single email field, "Send me a login link" button; no password field
  - `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`
  - `emailRedirectTo: 'https://pdtsingers.org/login.html'` added to OTP options
  - Loading state: button disabled + "Sending…" while in flight
  - Confirmation state: form hidden, email address shown, "Resend link" + "Try a different address" links
  - Error handling: inline below button (no full-card error state)
  - `onAuthStateChange(SIGNED_IN)` wired for magic link callback redirect to `/members/`
  - Session check at page init: `state-form` starts hidden; `await getSession()` before revealing any UI — eliminates form flash on load
  - `signInWithPassword` left in supabase.js with `// TODO: remove once magic link confirmed`
- ✅ **Login button styled gold** — `#c4a24a` background, `#1a1a1a` dark text; inline style + `#submit-btn` override in main.css
- ✅ **Tech Maintainer's Guide written** — `pdt-tech-maintainers-guide.md` + `.html` in repo root; covers accounts, deploy workflow, member management, Music Library, email, forms, common tasks, architecture, backlog
- ✅ **HTML doc style adopted** — major doc files now kept in both `.md` and `.html` format
- ✅ Netlify auto-publish confirmed locked — manual deploy only
- ▶️ TODO: Test magic link end-to-end with a real member email
- ▶️ TODO: Disable password auth in Supabase dashboard
- ▶️ TODO: Cap OTP expiry at 15 minutes (Supabase → Authentication → Settings → OTP Expiry; currently 24h)
- ▶️ TODO: Customize magic link email template (subject + body) to be warm and on-brand
- ▶️ TODO: Check is_active default in profiles table

### Session 4 — 2026-04-15

- ✅ members/comms.html built and deployed
- ✅ Google Drive Music Library migrated to Workspace Drive (president@pdtsingers.org), folder ID stored in `GOOGLE_DRIVE_MUSIC_FOLDER_ID` Netlify env var
- ✅ GOOGLE_DRIVE_MUSIC_FOLDER_ID updated in Netlify env vars
- ✅ Member portal consistency pass: directors-notes rebuilt, music.html nav fixed, "Home" link fixed across all member pages, Resources dead link removed, Cloudflare email obfuscation fixed via Cache-Control: no-transform in netlify.toml
- ✅ Six public placeholder pages built: about.html, performances.html, join.html, music.html, friends.html, contact.html
- ✅ Public nav restructured to full 7-link structure with real URLs
- ✅ Resend account created, pdtsingers.org domain verified, wired into Supabase SMTP
- ▶️ IN PROGRESS: Magic link login — login.html needs redesign to magic-link-only using supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
- ▶️ TODO: Customize Supabase magic link email template (subject + body) to be warm and on-brand
- ▶️ TODO: Test magic link end-to-end with a real email
- ▶️ TODO: Build Tech Support / Maintainer's Guide document
- ▶️ TODO: Disable password auth once magic link is confirmed working
- ▶️ TODO: Check is_active default in profiles table
- ▶️ TODO: Deploy public pages (commit abea34a pushed but verify live)
- ▶️ TODO: Populate real content on all public placeholder pages

### Session 3 addendum — 2026-03-31 (Tuesday morning)
- ✅ Nav logo oversized on music.html — fixed by adding `.nav-logo img { height: 48px; width: auto; }` to main.css; deployed
- ⚠️ env.local.js console error in production still present — benign but tracked for Wednesday fix
- 📋 **Backlog additions:**
  - Cross-posting to Facebook Events and newsletters — requirements TBD with Moss
  - members/whats-new.html — post-launch member-facing changelog page
  - Onboard Moss Egli (granddaughter, age 19) as Social Media Manager — prior SMM experience at flower store in Camas WA; create Supabase account, role TBD (events_editor to start or new social_media_manager role); first task: set up PDT Facebook group
  - About Us highlight for Moss — bio/blurb TBD
- ▶️ Wednesday: fix env.local.js console error → comms.html → public pages
- ✅ Reviewed project status and confirmed 2–3 week timeline to full launch
- ✅ Lodge phone decoupled from website dependencies — Kevin has iPhone 11 + Mint Mobile path
- ✅ Music Library architecture decision: Netlify Function proxy + Google Drive service account
  - Option A (public link) rejected: legal liability for licensed music under copyright law
  - Option B (OAuth) rejected: email mismatch, non-Gmail friction, IT help desk burden
  - Option B variant (Workspace emails for all members) rejected: adoption problem in practice
  - Option C (Netlify Function + service account) chosen: invisible to members, secure, free tier
- ✅ Created `pdtsingers.music@gmail.com` — staging account, not currently used
- ✅ Created Google Cloud project `pdt-singers-music-library`
- ✅ Enabled Google Drive API in GCP project
- ✅ Created API key `GOOGLE_DRIVE_API_KEY` (restricted to Drive API + pdtsingers.org)
- ✅ Created service account `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`
- ✅ Generated service account JSON key (original exposed in chat → rotated immediately)
- ✅ Added JSON key pattern to .gitignore
- ✅ Drive `.PDT` folder set to Restricted (revoked "Anyone with link")
- ✅ Drive `Music` folder shared with service account (Viewer only)
- ✅ All 5 Netlify env vars set (Supabase x2 + Drive x3)
- ✅ Updated `inject-env.js` to inject all 4 window.__PDT_ENV values
- ✅ Built `netlify/functions/drive-music.js` — serverless Drive proxy with JWT service account auth
- ✅ Built `members/music.html` — accordion Music Library with:
  - Song list loaded from Drive (one API call on page load)
  - Files loaded lazily per song on first open
  - Voice part detection: member's tracks sorted to top, highlighted in blue
  - "My Tracks + Sheet Music" button — staggered sequential downloads
  - "Download All" button
  - Graceful empty/error states
  - Local dev: direct Drive API calls; production: Netlify Function proxy
- ✅ Updated `pdt-requirements.md` with full Music Library architecture rationale (§5g)
- ✅ Updated `pdt-session-context.md` (this document)
- ⚠️ Music Library not yet tested in production — needs a deploy
- ⚠️ Drive Music folders are empty — files need to be copied from Dropbox before Music Library is useful
- ⚠️ Local dev testing of Music Library requires temporarily setting Music folder to "Anyone with link" — revert after testing
- ▶️ Next session: comms.html → public pages (About Us, Join Us) → deploy and test Music Library

### Session 2 — 2026-03-29
- ✅ Hero redesigned: replaced SVG skyline with split-logo design
- ✅ Dark mode added to variables.css + main.css
- ✅ Netlify auto-publish disabled
- ✅ Auth switched from magic link to email + password
- ✅ Music Fairy test account created and verified
- ✅ env.local.js local dev solution implemented
- ✅ Modal overlay fix, role visibility timing fix, blog CSS fixes
- ✅ Supabase posts RLS policies fixed and verified
- ✅ Chorus calendar built (members/calendar.html + css/calendar.css)
- ✅ generate-rehearsals Edge Function deployed and verified
- ⚠️ Calendar polish TODO (Phase 3):
  - Move prev/next arrows to flank calendar grid
  - Detail panel should not show on page load without event selected
  - "I won't be there" from dashboard Next Rehearsal card
  - Black button fixes

### Session 1 — 2026-03-28
- Defined project goals, audiences, site structure, tech stack
- Created initial pdt-requirements.md and pdt-session-context.md
- ✅ Placeholder site pushed to GitHub and deployed to Netlify
- ✅ DNS propagation complete — pdtsingers.org live on Netlify
- ✅ TechSoup registered — association code 4139-GERS-YP8U
- ✅ Supabase project created, full DB schema deployed
- ✅ Three blog pages built
- ✅ Role model finalized
