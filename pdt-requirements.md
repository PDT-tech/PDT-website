# PDT Singers Website — Requirements

**Last updated:** 2026-04-15  
**Status:** Draft — active development  
**Source:** Synthesized from project discussions + PDT_Singers_Site_Brief.md (March 2026)

---

## 1. Project Overview

Build and deploy a hand-coded website for **Portland DayTime Singers (PDT Singers)**, a
men's barbershop-style chorus based in Portland, Oregon. Founded by **Chris Gabel**
(Director) and **Kevin Bier** (Grand Poohbah), the group brings men together during
daytime hours to sing and to perform free concerts for seniors and residents of care
facilities throughout greater Portland.

PDT Singers is **Lodge #18 of the Worldwide Barbershop Quartet Association (WBQA)**,
chartered at the 2026 WBQA Annual Convention in San Antonio, Texas. PDT Singers is
**not affiliated with the Barbershop Harmony Society (BHS)** — this distinction must be
stated clearly on the About page.

**Charter certificate details** (readable from photo — ⚠️ certificate being reissued with corrections):
- Official lodge name: **Portland Oregon Lodge #18**
- State of incorporation: **Oregon** (certificate erroneously says Washington — correction pending)
- Principal office: **Hillsboro, Oregon** (certificate has incorrect Brush Prairie WA address — correction pending; address is Chris Gabel's)
- Chartered: **March 14, 2026**
- Signed by: Roger G. Heer (Secretary) and Kenny Ray Hatton (President), WBQA/SPPBSQSUS

**Domain:** pdtsingers.org (registered at helpinghosting.com)  
**Current placeholder site:** GreenGeeks.com — controlled by a deceased member; to be
retired once new site is live. DNS cutover at that time.

---

## 2. Goals & Priorities

| Priority | Goal | Primary Audience |
|----------|------|-----------------|
| 🔴 P1 | Public awareness: promote performances and mission | General public, care facility staff |
| 🔴 P1 | Recruitment: attract men who want to sing, make joining easy | Prospective male singers |
| 🟡 P2 | Member portal: private comms, leadership blog, resources | Current PDT Singers members |
| 🟡 P2 | Friends of PDT Singers: semi-public supporter content + social links | Supporters, fans, families |
| 🟢 P3 | Group email: Google Workspace for Nonprofits integration | Members, leaders |

---

## 3. Target Audiences

| Audience | Who They Are | What They Need |
|----------|-------------|----------------|
| Public Visitor | Care facility staff, families, community members | Who we are, upcoming performances, how to book us |
| Prospective Singer | Men interested in joining a men's chorus | What membership looks like, rehearsal schedule, how to join |
| Friend of PDT | Supporters, families, fans | News, announcements, social media links |
| Member | Active PDT Singers members | Private comms, leadership blog, rehearsal notes, resources |
| Admin | Kevin Bier, Chris Gabel, future co-maintainer | Manage members, post content, update schedule |

### Prospective Singer Profile
- Likely male, 40–75, who loves to sing or sang earlier in life
- Looking for a low-pressure, community-oriented, daytime-friendly group
- Key questions: What do you sing? When/where? Do I need to audition? What's the commitment?

---

## 4. Sitemap

### 4.1 Public Pages

| Page | URL | Key Content |
|------|-----|-------------|
| Home | `/` | Hero, tagline, upcoming performances, Join CTA, About teaser |
| About Us | `/about` | Mission, founding story, leadership bios, Duane's memorial (placeholder) |
| Our Music | `/music` | Barbershop tradition, song repertoire, video/audio clips |
| Performances | `/performances` | Upcoming schedule, past highlights, booking inquiry form |
| Join Us | `/join` | Why join, what to expect, rehearsal info, interest form |
| Friends of PDT | `/friends` | Announcements, social media links, newsletter signup |
| Contact | `/contact` | General contact form, email links |

### 4.2 Member-Only Pages (Login Required)

| Page | URL | Key Content |
|------|-----|-------------|
| Member Home | `/members/` | Dashboard, recent posts from all blogs, quick links |
| Director's Notes | `/members/directors-notes.html` | Blog — Chris Gabel |
| Grand Poohbah's Prattlings | `/members/poohbah.html` | Blog — Kevin Bier |
| Events Blog | `/members/events.html` | Performances, sing-outs, social event announcements |
| Communications | `/members/comms.html` | Announcements, meeting notes |
| Chorus Calendar | `/members/calendar.html` | Rehearsal + performance schedule; absence tracking |
| Music Library | `/members/music.html` | Song catalog; PDF sheet music + MP3 learning tracks per song; served via Netlify Function + Google Drive service account. See §5g. |
| Resources | `/members/resources.html` | Additional documents, links |
| Login | `/login.html` | Magic link only; accounts created by admin; inactive accounts blocked |

### 4.3 Utility
- **404** — Friendly error page in site style

---

## 5. Functional Requirements

### 5a. Authentication & Member Area
- Login via **Supabase** — email + password (switched from magic link 2026-03-29;
  see note below)
- Admin approval workflow:
  1. Prospective member submits interest form on /join
  2. Admin (Kevin / Grand Poohbah) receives email notification
  3. Admin creates account in Supabase dashboard and sets `is_active = true`
  4. Member receives credentials and logs in at /login
  5. Unapproved/inactive visitors see "Account not active" message
- Role-based: approved members see /members; others do not
- No self-registration — all accounts require admin creation

**Auth note — updated 2026-04-15:**
Magic link is the sole login method. Password auth is being retired. Resend (resend.com)
handles transactional email (magic links) via SMTP wired into Supabase. Sends from
noreply@pdtsingers.org. Resend domain verified April 2026. `shouldCreateUser: false`
ensures only admin-created accounts receive magic links — strangers get nothing.

### 5b. Content Management
- Public content: hand-edited HTML files, updated by maintainer
- Member content: stored in Supabase (blog posts, announcements) — rendered via JS fetch
- **Decap CMS** (optional, Phase 3+): lets non-technical admin post without touching code
- Sheet music/resources: files live in Google Workspace Drive (`president@pdtsingers.org`)
  under `Music/` (folder ID: `1uy1KhF8KUbLXiWsB-YeubduRJX2KiQ2a`). The `pdtsingers.music@gmail.com`
  staging account is retired. Files still need to be copied from Dropbox into Drive.

### 5c. Email
- Group email via **Google Workspace for Nonprofits** (Google Groups)
- Free for 501(c)(3) orgs — apply via TechSoup
- ✅ **IRS 501(c)(3) exemption letter now in hand** (confirmed at 3/26/26 BoD meeting)
- **Action required**: Kevin to share IRS documentation with Google to set up Workspace
- Groups.io for Friends of PDT email list — tabled until Google Workspace established

### 5d. Social Media
| Platform | Plan | Notes |
|----------|------|-------|
| Facebook | Launch | Primary platform — Moss Egli setting up group |
| Instagram | Launch | Secondary |
| YouTube | Phase 2 | Deferred until regular performances established |
| WBQA Facebook | Link only | `facebook.com/WBQA.Sings` — link from Friends page |

**Social Media Manager: Moss Egli** (Kevin's granddaughter, age 19) — prior SMM experience
at a flower store in Camas, WA. First task: set up PDT Singers Facebook group. Will drive
content creation in coordination with website updates. Needs Supabase member account;
role TBD (events_editor to start, or dedicated social_media_manager role if needed).
Add bio/highlight to About Us page post-launch.

### 5e. Forms (all via Netlify Forms — free tier)
- **Join Us interest form**: name, email, voice part (optional), message → triggers admin
  notification for Supabase approval workflow
- **Booking/performance inquiry**: on Performances page
- **General contact**: on Contact page

### 5f. SEO & Performance
- Fast-loading static site — no heavy frameworks
- Semantic HTML for accessibility
- Meta descriptions + OpenGraph tags on all pages
- XML sitemap + Google Search Console setup at launch
- Mobile-responsive design
- WCAG AA accessibility target

### 5g. Music Library — Architecture & Rationale

**Decision: Netlify Serverless Function proxy with Google Drive service account (Option C)**

The Music Library serves sheet music PDFs and MP3 learning tracks from Google Drive to
authenticated members. Three approaches were considered and rejected before settling on
the current architecture:

**Option A — "Anyone with the link" public sharing: REJECTED**
Making the Drive folder publicly accessible (even with an obscure link) exposes licensed
sheet music and learning tracks to anyone who discovers the URL. This creates known legal
liability under copyright law. Unacceptable.

**Option B — OAuth / member Google login: REJECTED**
Requiring members to authenticate with Google introduces multiple problems for this
membership: many members use ISP email addresses (Comcast, Xfinity, etc.) that are not
Google accounts; members would need to create a Google account linked to their personal
email just to access sheet music; the email address a member uses for Google may differ
from the address on their PDT website account, creating a mismatch the admin must
resolve; this creates ongoing IT help desk burden inappropriate for a volunteer chorus.

**Option B variant — issue pdtsingers.org Workspace accounts to all members: REJECTED**
Theoretically clean, but depends on members actually adopting and consistently using
their PDT email address. In practice, members forget passwords, ignore new accounts,
and continue using personal email. Same mismatch and help desk problems as Option B.

**Option C — Netlify Function proxy with service account (CHOSEN)**
A Netlify serverless function (`netlify/functions/drive-music.js`) authenticates to
Google Drive using a service account — a non-human Google identity with read-only
access to the Music folder only. Members call the function (authenticated via Supabase
session), the function fetches file listings from Drive, and returns them. Members never
interact with Google at all. No OAuth popup, no Google account required, no email
mismatch possible.

**Why this is right for PDT Singers:**
- Members just log into the PDT website — the music is there
- Zero Google friction for members who are 40–75 years old
- Credentials never exposed to browser
- Adding a new song = drop files in the Drive folder, done
- No DB changes needed (Drive is source of truth for song list)
- Well within Netlify free tier (125k function calls/month vs. ~30/day actual)
- Portable: the function is plain JS, not Netlify-proprietary

**Implementation details:**
- Service account: `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`
- GCP project: `pdt-singers-music-library`
- Drive: `.PDT` folder restricted; `Music` subfolder shared with service account (Viewer)
- Credential stored as `GOOGLE_SERVICE_ACCOUNT_JSON` in Netlify env vars (secret)
- Music folder ID stored as `GOOGLE_DRIVE_MUSIC_FOLDER_ID` in Netlify env vars
  (updated to Workspace Drive value `1uy1KhF8KUbLXiWsB-YeubduRJX2KiQ2a` — April 2026)
- Local dev: page calls Drive API directly using `GOOGLE_DRIVE_API_KEY` (Music folder
  must be temporarily set to "Anyone with link" for local testing — revert after)
- Production: page calls `/.netlify/functions/drive-music` which holds all credentials
- ✅ **Drive migration complete**: Music folder now in Workspace Drive (`president@pdtsingers.org`).
  Service account share updated. No code changes were required.

**Drive folder structure:**
```
Music/ (president@pdtsingers.org Workspace Drive — shared with service account, Viewer)
       (folder ID: 1uy1KhF8KUbLXiWsB-YeubduRJX2KiQ2a)
    ├── Ain't Misbehavin'/        ← performance repertoire
    ├── God Bless America/        ← performance repertoire
    ├── If There's Anybody Here (From Out Of Town)/
    ├── Irish Blessing (Mel Knight)/   ← rehearsal only
    ├── Just in Time/
    ├── Just Men Singing Our Song/     ← rehearsal only
    ├── Let The Rest Of The World Go By/
    ├── Ride the Chariot/
    ├── That's An Irish Lullaby/
    ├── Who Told You/
    └── You're As Welcome As The Flowers In May/  ← rehearsal only
```

Each song folder contains: one PDF (sheet music) + MP3 learning tracks (naming varies
by song — some have simple Tenor/Lead/Bari/Bass tracks, some have Dominant/Left/Removed
variants). The page sorts the member's own voice part tracks to the top and offers
"My Tracks + Sheet Music" one-click download alongside "Download All."

No Supabase `songs` table — Drive folder list is the source of truth. Adding a song
requires only creating a new folder in Drive and dropping files in.

### 5h. Cross-Posting (backlog — requirements TBD)
Post PDT events and announcements from the website to Facebook Events and member
newsletters. Moss Egli to drive requirements. Likely Phase 3+.

### 5i. Member Changelog Page (post-launch)
`members/whats-new.html` — simple static page listing website functionality changes
(not content updates). Hand-maintained by Kevin. Gives members a place to learn what's
new without asking. No DB involvement.

### Voice & Tone
- First person plural: "we sing," "come sing with us"
- Inclusive, encouraging, never exclusive or jargon-heavy
- Community-focused and heartfelt; warm, welcoming, accessible to all ages
- Not corporate, not overly formal

### Tagline
**"Music, Fellowship & Fun"** — the WBQA society tagline, featured on the PDT logo

### Color Palette
| Variable | Hex | Usage |
|----------|-----|-------|
| `--sky` | `#c8dce8` | Hero gradient top |
| `--sky-mid` | `#a8c4d4` | Hero gradient mid |
| `--sky-deep` | `#6a9ab8` | Accents, links, labels |
| `--forest` | `#1a1a1a` | Primary dark, nav, mission band BG |
| `--cream` | `#f7f3ee` | Page background |
| `--warm` | `#c8a882` | Warm accent |
| `--gold` | `#c4a24a` | Gold accent |
| `--sage` | `#4e6e4e` | Tagline pill border |
| `--white` | `#ffffff` | Cards, nav background |

Palette drawn directly from the PDT logo watercolor wash.

### Typography
| Role | Font | Fallback |
|------|------|---------|
| Display/headings | Playfair Display (Google Fonts) | Georgia, serif |
| Body/UI | Source Serif 4 (Google Fonts) | Arial, sans-serif |

### Logo Assets
| File | Description | Usage |
|------|-------------|-------|
| `PDT_logo_bw.png` | B&W version | Nav, dark backgrounds |
| `PDT_logo_color_1.jpeg` | Color variant 1 | Hero, marketing |
| `PDT_logo_color_2.jpeg` | Color variant 2 | Alternate placements |
| `WBQA_logo.png` | WBQA badge (black on transparent) | Footer, About page |
| *(pending)* | Vectorized PDT logo files (SVG/EPS) | From Mercedes Gibson via Dropbox — Grant coordinating |
| *(pending)* | "Words only" logo variant | Text element only — from Mercedes Gibson |

WBQA logo also available as `WBQA_logo.avif` (424×434px, RGBA, black on transparent — works on any background).

### WBQA Logo Placement
- **Footer**: persistent badge on all pages alongside PDT logo
- **About Us**: dedicated callout — "Proud Lodge #18 of the WBQA, chartered at the 2026 San Antonio Convention"
- **Join Us**: credibility signal — PDT Singers connects you to a worldwide barbershop community

### Hero Treatment
SVG skyline illustration (built in comp): Portland skyline + Mt Hood + Pacific NW firs + musical notes — mirrors the PDT logo. No photo dependency at launch.

### Photography
Real group photos available. Authentic performance moments. Warm lighting preferred.

---

## 7. Content Inventory

### 7.1 Content We Have
- Logo files (color and B&W variants, WBQA logo)
- **Photos of the group** — confirmed in hand, including:
  - `IMG_5879.JPEG` — First sing-out at The Social Kitchen, Vancouver WA, 2/6/2026.
    Most of the chorus singing, Chris Gabel conducting, warm restaurant setting.
    Excellent hero/about page candidate.
  - `Chris_receiving_Lodge_certificate.jpg` — Chris Gabel receiving Lodge #18 charter
    certificate at WBQA Convention banquet, San Antonio TX, 3/14/2026. Certificate
    clearly readable. Use for About page / WBQA affiliation section.
- Leadership names, titles, and bios (see §8)
- Performance history (first performance February 2026)
- Rehearsal schedule and location (confirmed)
- Homepage comp (HTML) as design baseline

### 7.2 Content to Create
- Home page hero copy
- About Us narrative — founding story, mission, Duane's remembrance (pending group discussion)
- Leadership bios (expanded, photo-ready)
- Join Us page — what to expect, rehearsal details, FAQ
- Performances page — schedule format, booking inquiry copy
- Our Music page — barbershop tradition, repertoire, media embeds
- Friends of PDT — define what a "Friend" is and what they receive
- Member portal initial posts from Chris and Kevin

### 7.3 Resolved Content Decisions
- **Rehearsals**: Mondays 10:30am–12:30pm, 13420 SW Butner Rd, Beaverton OR 97005
  (Westside United Methodist / Westside Journey UMC)
- **Voice placement**: Not an audition — sing Happy Birthday in comfortable range.
  All men who love to sing are welcome.
- **BHS relationship**: Not affiliated, but warm collegial relationship. State clearly on About page.
- **Sheet music**: In Google Workspace Drive (`president@pdtsingers.org`, `Music/` folder,
  ID: `1uy1KhF8KUbLXiWsB-YeubduRJX2KiQ2a`); served via Netlify Function + service account.
  Drive migration complete as of April 2026 — no code changes were required.
- **Duane Lundsten memorial**: TBD pending group discussion. Reserve placeholder in design.
  No action needed before Phase 1. Memorial plaque also being procured (Kevin).
- **Performance fee policy**: $150 for standard 40-minute performance; free for
  philanthropic, recruitment, and mission-aligned performances
- **Current repertoire**: 8 songs (just reached goal with addition of God Bless America)
- **Christmas repertoire**: 10–12 songs planned; Chris starting with songs members know
- **Lodge phone**: Kevin has iPhone 11 ready; Mint Mobile ~$180/yr. Decoupled from website
  dependencies — can proceed independently.
- **Social media**: **Moss Egli** (Kevin's granddaughter, age 19, prior SMM experience) confirmed as PDT SMM. First task: set up Facebook group. Website content and social media to be coordinated going forward.

---

## 8. Leadership

### Chris Gabel — Director & Co-Founder
Active in the barbershop world since the 1990s; has sung in multiple award-winning quartets.
Previously directed the **Tualatin Valley Harmony Masters** in Hillsboro, OR. Had the original
vision for a daytime chorus; founding director of PDT Singers.

### Kevin Bier — President, Grand Poohbah (Admin Director) & Co-Founder
Began his barbershop journey in Boise, Idaho in 1980. Directed choruses in Boise and Boulder,
CO; on the founding team for the **Denver Tech Chorus**. He and Chris most recently sang
together in the quartet **7th Heaven** for nine years. Handles administration and serves as
assistant director. Formal corporate title: **President**.

### Other Leadership
| Name | Title | Corporate Role |
|------|-------|------|
| Grant Gibson | Nearly-Grand Poohbah | Secretary/Treasurer |
| Sam Vigil | Poohbah-at-Large | Board Member at Large — Marketing |
| Ray Heller | Poohbah-at-Large | Board Member at Large — Chorus contact / outreach |
| Duane Lundsten † | Poohbah of Complex Stuff | In memoriam — our tech guy, passed March 2026 |
| Moss Egli | Social Media Manager | Kevin's granddaughter, age 19; prior SMM experience; driving Facebook + social content |

---

## 9. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Markup/Styles | Hand-coded HTML5 + CSS3 | Full control, no framework overhead |
| Interactivity | Vanilla JavaScript | Minimal JS needed; no framework required |
| Auth & DB | **Supabase** (free tier) | Member login, admin approval workflow, blog/post storage |
| Hosting | Netlify (free tier) | Free SSL, GitHub deploy, custom domain, Forms included |
| Serverless Functions | Netlify Functions (free tier) | Drive proxy for Music Library; 125k calls/month free |
| Forms | Netlify Forms | No backend needed, free tier sufficient |
| Music Library | Google Drive + Netlify Function | Service account proxy; see §5g for full rationale |
| CMS (optional) | Decap CMS | Non-technical blog posting — Phase 3+ |
| Repo | GitHub | Version control, Netlify CI/CD integration |
| Email | Google Workspace for Nonprofits | Free via TechSoup; blocked on IRS letter |
| Domain | pdtsingers.org (already owned) | DNS to be pointed to Netlify at cutover |

**Monthly cost target:** Under $10/mo (likely free outside ~$12/yr domain renewal)

---

## 10. Build Phases

### Phase 1 — Foundation (current)
- ✅ GitHub repo, Netlify hosting, pdtsingers.org DNS
- ✅ Supabase project, DB schema, auth
- ✅ Member portal: login, dashboard, three blogs, calendar, Music Library
- ✅ Netlify env vars: Supabase + Google Drive credentials
- ✅ Netlify Function: Drive proxy (`netlify/functions/drive-music.js`)
- ✅ Edge Function: env var injector updated for Drive credentials
- ✅ `members/comms.html` — Communications page
- ✅ Public pages: about.html, performances.html, join.html, music.html, friends.html, contact.html (placeholder content)
- ✅ Public nav restructured to full 7-link structure with real URLs
- ✅ Resend SMTP wired into Supabase (noreply@pdtsingers.org, domain verified April 2026)
- [ ] Magic link login — login.html redesign (in progress)
- [ ] Magic link email template customization (subject + body, warm and on-brand)
- [ ] Tech Maintainer's Guide

### Phase 2 — Public Site Complete
- [ ] Performances page (+ Netlify Form: booking inquiry)
- [ ] Our Music page
- [ ] Friends of PDT page
- [ ] Contact page (+ Netlify Form)
- [ ] Upload group photos
- [ ] Finalize all public copy
- [ ] SEO: meta tags, XML sitemap, Google Search Console

### Phase 3 — Polish & Launch
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing
- [ ] Final content review
- [ ] Populate Drive Music folders with files from Dropbox

### Phase 4 — Post-Launch
- [ ] Google Workspace for Nonprofits activation
- ✅ Migrate Music Library Drive share to Workspace Drive — complete April 2026
- [ ] Social media accounts live → update Friends page links
- [ ] Onboard second site maintainer
- [ ] Document update procedures

---

## 11. Open Questions

- [x] Domain: pdtsingers.org at helpinghosting.com; GreenGeeks placeholder to be retired
- [x] Director name: **Chris Gabel** (German spelling confirmed)
- [x] Voice parts: TTBB barbershop chorus
- [x] Logos: current raster versions in hand; vectorized + "words only" pending from Mercedes Gibson
- [x] Rehearsal details: confirmed (see §7.3)
- [x] Charter: Lodge #18, WBQA Convention 2026, San Antonio TX (certificate reissue pending)
- [x] Photos: group photos available
- [x] Social media: website first; Facebook deferred; may hire freelancer
- [x] Tagline: "Music, Fellowship & Fun"
- [x] Performance fee: $150 standard; free for mission-aligned performances
- [x] GitHub repo: **https://github.com/kevin36v/PDT-website**
- [x] IRS 501(c)(3) letter: **in hand** — Google Workspace application now unblocked
- [x] Music Library architecture: Netlify Function + service account (see §5g)
- [x] Lodge phone: decoupled — Kevin has iPhone 11 + Mint Mobile path, proceed independently
- [x] Nav logo oversized on music.html — fixed in main.css
- [x] Social media manager: **Moss Egli** (Kevin's granddaughter) — confirmed
- [ ] **Moss Egli onboarding** — Supabase account + role TBD; first task: PDT Facebook group
- [ ] **Cross-posting** — Facebook Events + newsletters; requirements TBD with Moss (§5h)
- [ ] Desired email addresses (info@, director@, members@, etc.)?
- [ ] Who is the second site maintainer (post-launch)?
- [ ] Should member Blog allow comments, or read-only initially?
- [ ] Duane Lundsten memorial — form/placement TBD (pending group discussion)
- [ ] Grant's prioritized website landing page elements — input pending
- [ ] Vectorized logo files — pending delivery from Mercedes Gibson via Dropbox
- [ ] Groups.io for Friends of PDT — tabled until Google Workspace established
- [ ] Music Library local dev testing — Music folder must be temporarily set to
      "Anyone with link" for local API key calls to work; revert after testing

---

## 12. Success Criteria

- Site live at pdtsingers.org with SSL, replacing GreenGeeks placeholder
- All public pages rendering correctly on mobile and desktop
- Member login working with admin approval flow (at least 2 test accounts)
- Contact, Join Us, and booking forms submitting via Netlify Forms
- Google Workspace for Nonprofits email active (post IRS letter)
- At least one member blog post and one announcement visible to logged-in members
- Music Library functional: members can browse songs, download tracks and sheet music

---

## 13. Backlog / Open Issues

Logged 2026-04-17. These are confirmed to-dos, not yet assigned to a build phase.

---

### 13-01 — Portal exit: return to public site
**Context:** No visible path from inside the member portal back to the public home page.  
**Fix:** Add a link from within the portal (distinct from the "Home" link that returns to the portal dashboard). One strong candidate: make "Portland DayTime Singers" in the portal footer a link to `/`. Labels for the two home links must be clearly distinguishable — e.g., "Portal Home" vs. "PDT Singers Home" or similar.  
**Affects:** All `/members/` pages — footer and/or nav.

---

### 13-02 — Logo: replace raster placeholders with vector art
**Context:** Vectorized logo files received from Mercedes Gibson. Currently two raster placeholders on the main page.  
**Fix:** Replace placeholder `<img>` tags with the SVG/vector assets. Validate rendering on both light and dark mode — the logo block art may be low-contrast on dark backgrounds and may require a dark-mode variant (e.g., inverted or alternate SVG, CSS `filter`, or `prefers-color-scheme` conditional).  
**Affects:** Main page (two placements); potentially nav and footer.

---

### 13-03 — "Men who love to sing" headline: force three-line break
**Context:** Current line breaks are unsatisfying on desktop.  
**Desired break:**
```
Men who love to sing —
and bring that joy to
their community
```
**Fix:** Use `<br>` tags or `max-width` + forced line breaks to achieve this layout. Verify it doesn't break on mobile (may need responsive override).  
**Affects:** `index.html` hero/intro block.

---

### 13-04 — Calendar page: restore h1 colored horizontal border
**Context:** The heavy colored horizontal border on the `<h1>` was removed from the calendar page, making it inconsistent with all other member pages (events, director's notes, comms all have it).  
**Fix:** Restore the same `<h1>` border treatment used on `/members/events`, `/members/directors-notes`, and `/members/comms`.  
**Affects:** `members/calendar.html`

---

### 13-05 — Calendar "Today" button: dark-mode contrast
**Context:** The "Today" button is too low-contrast on dark-mode displays.  
**Fix:** Audit the button's background and text colors under `prefers-color-scheme: dark`. Apply sufficient contrast ratio (WCAG AA minimum 4.5:1). May need a dark-mode override in the calendar CSS.  
**Affects:** `members/calendar.html` — "Today" button styles.

---

### 13-06 — Mobile: WBQA logo too small and right-justified
**Context:** On mobile, the WBQA logo is unreadably small and right-justified in the hero area.  
**Fix:** On mobile widths, move the WBQA logo below the CTA line ("We'd love for you to come sing with us — or come hear us sing"), center it horizontally, and size it so it's legible.  
**Affects:** `index.html` hero section, mobile breakpoint CSS.

---

### 13-07 — Mobile: no path to member portal
**Context:** On mobile, there is no visible link or navigation to the member login/portal.  
**Fix:** Add a Member login link accessible from mobile — likely in a hamburger menu, a footer link, or a persistent small link in the mobile header. Coordinate with 13-08 (footer home link) and 13-11 (mobile header quick links decision).  
**Affects:** Mobile nav and/or footer on public pages.

---

### 13-08 — Footer: add home page link
**Context:** No link back to the home page in the footer. Most consequential on mobile where nav may be collapsed.  
**Fix:** Add a home page link (`/`) to the footer on all pages (both public and member portal). On the portal side, this doubles as the portal-exit link described in 13-01 — coordinate the implementation.  
**Affects:** Footer include / all pages.

---

### 13-09 — Calendar: "Today" and "+ New Event" buttons on same horizontal line
**Context:** The two calendar action buttons are currently on separate lines.  
**Fix:** Place both buttons on the same horizontal line. Dynamic horizontal spacing:
- Both buttons flush to the outer edges of the calendar grid at minimum window width
- As window widens, buttons float back toward calendar center, maintaining the minimum-width spread as their maximum separation
- On mobile: outer edges of buttons align with outer edges of calendar  
**Affects:** `members/calendar.html` — button layout and responsive CSS.

---

### 13-10 — Portal footer: "Portland DayTime Singers" as exit link
**Context:** See 13-01. The portal footer's "Portland DayTime Singers" wordmark is the natural anchor for a "return to public site" link.  
**Fix:** Wrap it in an `<a href="/">` tag. Ensure the label is visually distinct from the portal's "Home" navigation link so members understand the difference.  
**Note:** This may fully satisfy 13-01 — evaluate together.  
**Affects:** Member portal footer.

---

### 13-11 — Mobile header: quick links disappear at mobile width — decision needed
**Context:** At mobile window widths, the quick links in the header collapse/disappear. This is intentional behavior, but the right resolution is undecided.  
**Options:**
- A) Two-line header at mobile widths to keep quick links visible
- B) Keep single-line header; require user to navigate Home and use the QUICK LINKS block  
**Decision needed before implementation.**  
**Affects:** Header CSS, mobile breakpoints.

---

### 13-12 — Auto-populate Monday rehearsals through end of calendar year
**Context:** Rehearsals happen every Monday 10:30am–12:30pm. Currently must be added manually.  
**Fix:** Implement bulk-creation of recurring Monday rehearsal events from today (or a chosen start date) through December 31 of the current year. Two approaches to evaluate:
- A) Run a one-time script against Supabase to insert all remaining Mondays now
- B) Extend the Edge Function (already handles auto-generation) to support recurring-rule events  
Rehearsal details: Mondays 10:30am–12:30pm, Westside Journey UMC, 13420 SW Butner Rd, Beaverton OR 97005.  
**Affects:** Supabase `events` table; possibly the Edge Function or a new admin utility.

---

### 13-13 — Main page: "Portland DayTime Singers" header link underline full phrase
**Context:** On the Chorus Calendar page (and potentially others), the "Portland DayTime Singers" text in the header is underlined word-by-word (each word separately underlined) rather than as a single continuous link.  
**Fix:** Ensure the link underline spans the full phrase as a unit. Likely a CSS `display` or `white-space` fix on the anchor element.  
**Affects:** Member portal header — link styling.

---

### 13-14 — Main page: animated photo carousel
**Context:** Add an animated photo carousel between the "Men who love to sing" block and the "Come sing with us" section.  
**Behavior:**
- Starts at a random position in the Google Workspace photo cache
- Advances through images in random order
- Clicking a photo opens a full-size overlay (lightbox)
- Overlay is dismissable by clicking the image again, clicking outside it, or pressing Escape (common convention — finalize during implementation)
- Photo source: Google Workspace Drive image cache (same service account architecture as Music Library — see §5g)  
**Note:** This overlaps significantly with `pdt-photo-feature.md` (photo upload/gallery planning). Reconcile the two specs before implementation — the carousel may be the Phase 1 expression of the larger photo feature.  
**Affects:** `index.html`, possibly a new Netlify Function for photo Drive access, CSS lightbox overlay.

---

---

## 13. Backlog / Open Issues

Logged 2026-04-17. These are confirmed to-dos, not yet assigned to a build phase.

---

### 13-01 — Portal exit: return to public site
**Context:** No visible path from inside the member portal back to the public home page.  
**Fix:** Add a link from within the portal (distinct from the "Home" link that returns to the portal dashboard). One strong candidate: make "Portland DayTime Singers" in the portal footer a link to `/`. Labels for the two home links must be clearly distinguishable — e.g., "Portal Home" vs. "PDT Singers Home" or similar.  
**Affects:** All `/members/` pages — footer and/or nav.

---

### 13-02 — Logo: replace raster placeholders with vector art
**Context:** Vectorized logo files received from Mercedes Gibson. Currently two raster placeholders on the main page.  
**Fix:** Replace placeholder `<img>` tags with the SVG/vector assets. Validate rendering on both light and dark mode — the logo block art may be low-contrast on dark backgrounds and may require a dark-mode variant (e.g., inverted or alternate SVG, CSS `filter`, or `prefers-color-scheme` conditional).  
**Affects:** Main page (two placements); potentially nav and footer.

---

### 13-03 — "Men who love to sing" headline: force three-line break
**Context:** Current line breaks are unsatisfying on desktop.  
**Desired break:**
```
Men who love to sing —
and bring that joy to
their community
```
**Fix:** Use `<br>` tags or `max-width` + forced line breaks to achieve this layout. Verify it doesn't break on mobile (may need responsive override).  
**Affects:** `index.html` hero/intro block.

---

### 13-04 — Calendar page: restore h1 colored horizontal border
**Context:** The heavy colored horizontal border on the `<h1>` was removed from the calendar page, making it inconsistent with all other member pages (events, director's notes, comms all have it).  
**Fix:** Restore the same `<h1>` border treatment used on `/members/events`, `/members/directors-notes`, and `/members/comms`.  
**Affects:** `members/calendar.html`

---

### 13-05 — Calendar "Today" button: dark-mode contrast
**Context:** The "Today" button is too low-contrast on dark-mode displays.  
**Fix:** Audit the button's background and text colors under `prefers-color-scheme: dark`. Apply sufficient contrast ratio (WCAG AA minimum 4.5:1). May need a dark-mode override in the calendar CSS.  
**Affects:** `members/calendar.html` — "Today" button styles.

---

### 13-06 — Mobile: WBQA logo too small and right-justified
**Context:** On mobile, the WBQA logo is unreadably small and right-justified in the hero area.  
**Fix:** On mobile widths, move the WBQA logo below the CTA line ("We'd love for you to come sing with us — or come hear us sing"), center it horizontally, and size it so it's legible.  
**Affects:** `index.html` hero section, mobile breakpoint CSS.

---

### 13-07 — Mobile: no path to member portal
**Context:** On mobile, there is no visible link or navigation to the member login/portal.  
**Fix:** Add a Member login link accessible from mobile — likely in a hamburger menu, a footer link, or a persistent small link in the mobile header. Coordinate with 13-08 (footer home link) and 13-11 (mobile header quick links decision).  
**Affects:** Mobile nav and/or footer on public pages.

---

### 13-08 — Footer: add home page link
**Context:** No link back to the home page in the footer. Most consequential on mobile where nav may be collapsed.  
**Fix:** Add a home page link (`/`) to the footer on all pages (both public and member portal). On the portal side, this doubles as the portal-exit link described in 13-01 — coordinate the implementation.  
**Affects:** Footer include / all pages.

---

### 13-09 — Calendar: "Today" and "+ New Event" buttons on same horizontal line
**Context:** The two calendar action buttons are currently on separate lines.  
**Fix:** Place both buttons on the same horizontal line. Dynamic horizontal spacing:
- Both buttons flush to the outer edges of the calendar grid at minimum window width
- As window widens, buttons float back toward calendar center, maintaining the minimum-width spread as their maximum separation
- On mobile: outer edges of buttons align with outer edges of calendar  
**Affects:** `members/calendar.html` — button layout and responsive CSS.

---

### 13-10 — Portal footer: "Portland DayTime Singers" as exit link
**Context:** See 13-01. The portal footer's "Portland DayTime Singers" wordmark is the natural anchor for a "return to public site" link.  
**Fix:** Wrap it in an `<a href="/">` tag. Ensure the label is visually distinct from the portal's "Home" navigation link so members understand the difference.  
**Note:** This may fully satisfy 13-01 — evaluate together.  
**Affects:** Member portal footer.

---

### 13-11 — Mobile header: quick links disappear at mobile width — decision needed
**Context:** At mobile window widths, the quick links in the header collapse/disappear. This is intentional behavior, but the right resolution is undecided.  
**Options:**
- A) Two-line header at mobile widths to keep quick links visible
- B) Keep single-line header; require user to navigate Home and use the QUICK LINKS block  
**Decision needed before implementation.**  
**Affects:** Header CSS, mobile breakpoints.

---

### 13-12 — Auto-populate Monday rehearsals through end of calendar year
**Context:** Rehearsals happen every Monday 10:30am–12:30pm. Currently must be added manually.  
**Fix:** Implement bulk-creation of recurring Monday rehearsal events from today (or a chosen start date) through December 31 of the current year. Two approaches to evaluate:
- A) Run a one-time script against Supabase to insert all remaining Mondays now
- B) Extend the Edge Function (already handles auto-generation) to support recurring-rule events  
Rehearsal details: Mondays 10:30am–12:30pm, Westside Journey UMC, 13420 SW Butner Rd, Beaverton OR 97005.  
**Affects:** Supabase `events` table; possibly the Edge Function or a new admin utility.

---

### 13-13 — Header link: underline "Portland DayTime Singers" as full phrase
**Context:** On the Chorus Calendar page (and potentially others in the member portal), the "Portland DayTime Singers" text in the header is underlined word-by-word rather than as a single continuous underline.  
**Fix:** Ensure the link underline spans the full phrase as a unit. Likely a CSS `display` or `white-space` fix on the anchor element.  
**Affects:** Member portal header — link styling.

---

### 13-14 — Main page: animated photo carousel
**Context:** Add an animated photo carousel between the "Men who love to sing" block and the "Come sing with us" section.  
**Behavior:**
- Starts at a random position in the Google Workspace photo cache
- Advances through images in random order
- Clicking a photo opens a full-size overlay (lightbox)
- Overlay is dismissable by clicking the image again, clicking outside it, or pressing Escape (common convention — finalize during implementation)
- Photo source: Google Workspace Drive image cache (same service account architecture as Music Library — see §5g)  
**Note:** This overlaps significantly with `pdt-photo-feature.md` (photo upload/gallery planning). Reconcile the two specs before implementation — the carousel may be the Phase 1 expression of the larger photo feature.  
**Affects:** `index.html`, possibly a new Netlify Function for photo Drive access, CSS lightbox overlay.

---
