# PDT Singers Website — Requirements

**Last updated:** 2026-04-25  
**Status:** Active — Phase 1 & 2 complete; Phase 3 in progress  
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
✅ GreenGeeks placeholder retired — DNS cutover to Netlify complete.

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
| The Sunburst | `/members/sunburst.html` | Newsletter — Drive-backed PDF issue listing; admin posting only |
| Admin Attendance | `/members/admin-attendance.html` | Admin attendance override + sing-out census report (admin/musical_director only) |
| Chorus Calendar | `/members/calendar.html` | Rehearsal + performance schedule; absence tracking |
| Music Library | `/members/music.html` | Song catalog; PDF sheet music + MP3 learning tracks per song; served via Netlify Function + Google Drive service account. See §5g. |
| Can You Be There? | `/members/attendance.html` | Member attendance self-declaration for upcoming rehearsals and sing-outs; see §5j |
| Resources | `/members/resources.html` | Additional documents, links — suppressed from nav; file retained, content TBD |
| Login | `/login.html` | OTP (6-digit code) only; accounts created by admin only; inactive accounts blocked |

### 4.3 Utility
- **404** — Friendly error page in site style

---

## 5. Functional Requirements

### 5a. Authentication & Member Area
- Login via **Supabase** — email → 6-digit OTP code (switched from password auth 2026-03-29,
  then to OTP from magic links 2026-04-24)
- Admin approval workflow:
  1. Prospective member submits interest form on /join
  2. Admin (Kevin / Grand Poohbah) receives email notification
  3. Admin creates account in Supabase dashboard and sets `is_active = true`
  4. Member receives OTP code by email, enters code at /login
  5. Unapproved/inactive visitors see "Account not active" message
- Role-based: approved members see /members; others do not
- No self-registration — all accounts require admin creation

**Auth method — OTP (current, as of 2026-04-24):**
Login uses 6-digit numeric codes sent via Resend (resend.com), wired into Supabase SMTP.
Sends from noreply@pdtsingers.org. Resend domain verified April 2026. OTP expiry is 10 minutes / 600 seconds (confirmed in Supabase → Authentication → Settings).
`shouldCreateUser: false` ensures only admin-created accounts receive codes — strangers
get nothing. Magic link code is preserved in login.js behind `const USE_MAGIC_LINKS = false`
flag for potential future use, but is not currently active.

**Previous auth methods:**
- 2026-03-28 to 2026-03-29: magic link (abandoned due to Supabase SMTP rate limit)
- 2026-03-29 to 2026-04-15: password auth (stateless, simple)
- 2026-04-15 to 2026-04-24: magic link (Resend SMTP enabled high throughput)
- 2026-04-24 onwards: OTP code (current, simpler UX for members)

### 5b. Content Management
- Public content: hand-edited HTML files, updated by maintainer
- Member content: stored in Supabase (blog posts, announcements) — rendered via JS fetch
- **Decap CMS** (optional, Phase 3+): lets non-technical admin post without touching code
- Sheet music/resources: files live in Google Workspace Drive (`president@pdtsingers.org`)
  under `Music/` (folder ID: `REDACTED-see-Netlify-env-GOOGLE_DRIVE_MUSIC_FOLDER_ID`). The `pdtsingers.music@gmail.com`
  staging account is retired. ✅ Files migrated from Dropbox into Drive — Dropbox retired April 2026.

### 5c. Email
- Group email via **Google Workspace for Nonprofits** (Google Groups)
- ✅ **Google Workspace for Nonprofits approved and active** — approved via Goodstack (2026-04-18). Note: TechSoup was the historical nonprofit vetting partner; Goodstack is now the active Google program partner.
- ✅ **IRS 501(c)(3) exemption letter in hand** (confirmed at 3/26/26 BoD meeting)
- Groups.io for Friends of PDT email list — deferred to post-launch

### 5d. Social Media
| Platform | Plan | Notes |
|----------|------|-------|
| Facebook | Launch | Primary platform — Moss Egli — PDT Facebook page live April 2026 |
| Instagram | Launch | Secondary |
| YouTube | Phase 2 | Deferred until regular performances established |
| WBQA Facebook | Link only | `facebook.com/WBQA.Sings` — link from Friends page |

**Social Media Manager: Moss Egli** (Kevin's granddaughter, age 19) — prior SMM experience
at a flower store in Camas, WA. First task: set up PDT Singers Facebook group. Will drive
content creation in coordination with website updates. ✅ Supabase account created,
events_editor role assigned, Facebook group setup complete. Bio/highlight on About Us
page — deferred.

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

### 5f-1. Member Attendance Tracking

Members declare attendance intent at `/members/attendance.html`:
- **Rehearsals**: Members are assumed attending unless they mark "I won't be there"
- **Sing-outs and non-rehearsal events**: Three-state status (attending / not_sure / not_attending)

Members make local selections using dropdowns; a single "Save" button batch-writes all
changed rows to Supabase. On success, the page shows "Saved ✓" confirmation.

When Save succeeds, a Supabase Edge Function (`notify-attendance-change`) sends:
- Director email with member's status summary and deep-link to attendance census
- Member confirmation email (includes full event details if attending)

**Admin features:**
- `/members/admin-attendance.html` (admin/musical_director only): census view showing
  all members' statuses (attending / not sure / not attending / no response) for upcoming
  sing-outs and rehearsals. Accepts `?event=<uuid>` deep-link from director emails.
- Event fields `call_time`, `address`, `dress_code`, `parking_notes` appear on attendance
  cards and in member confirmation emails.

**Deferred features** (post-launch, see pdt-issues.md #031–#033):
- Escalation pipeline: 10-day nudge emails + 7-day auto-mark with director notification
- Admin override: Kevin entering clipboard marks from rehearsals ✅ DONE — Fixed 2026-04-25. See pdt-issues.md #032.
- Attendance report: detailed voting breakdown ✅ DONE — Fixed 2026-04-25. See pdt-issues.md #033.

**Technical:** Batch-save model prevents per-row notifications; single `event_attendance`
table stores all status; Edge Function replaces prior per-row database webhook approach.

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
- Drive: Music folder in Workspace Drive (president@pdtsingers.org), shared with service account (Viewer). Dropbox retired April 2026.
- Credential stored as `GOOGLE_SERVICE_ACCOUNT_JSON` in Netlify env vars (secret)
- Music folder ID stored as `GOOGLE_DRIVE_MUSIC_FOLDER_ID` in Netlify env vars
  (Workspace Drive value — April 2026)
- **File listings** (members/music.html → `/api/music`): Netlify Function
  (`netlify/functions/drive-music.js`) authenticates to Drive via service account,
  returns folder + file listings as JSON
- **File downloads** (members/music.html → `/api/music-download`): Netlify Edge Function
  (`netlify/edge-functions/drive-music-download.js`) streams file content directly to
  browser — no buffering, no size ceiling, service account token never leaves function.
  Replaces prior base64-encoding approach (Netlify Function) which hit 6MB response
  limit immediately on first production use.
- Local dev: page calls Drive API directly using `GOOGLE_DRIVE_API_KEY` for both listings
  and downloads (Music folder must be temporarily set to "Anyone with link" for local
  testing — revert after)
- ✅ **Drive migration complete**: Music folder now in Workspace Drive (`president@pdtsingers.org`).
  Service account share updated. No code changes were required.

**Drive folder structure:**
```
Music/ (president@pdtsingers.org Workspace Drive — shared with service account, Viewer)
       (folder ID: REDACTED-see-Netlify-env-GOOGLE_DRIVE_MUSIC_FOLDER_ID)
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

### 5j. "Can You Be There?" Attendance Page — `/members/attendance.html`

**Last updated:** 2026-04-21
**Status:** UI redesign approved; backing logic and schema already built

#### Overview

The attendance page lets members declare their availability for upcoming rehearsals
and sing-outs. It is a member-facing self-service tool; the director and admin see
member responses via the existing notification emails and (future) the sing-out
attendance report (FWI-C, pdt-issues.md #033).

#### Layout

Two side-by-side clusters on a single page:

| Left cluster | Right cluster |
|---|---|
| Sing-outs & Events | Rehearsals |
| Visual priority — sing-outs are special | Routine — lower visual weight |
| Three-way status radio | Two-way status radio |

Each cluster is enclosed in a light-stroke rounded rectangle. On mobile, clusters
stack vertically (sing-outs above rehearsals).

#### Dropdown behavior

Each cluster has a dropdown listing all events of that type with
`event_date >= today`, ordered soonest first. The soonest event is selected
by default when the page loads. Selecting a different event from the dropdown
immediately reloads the status and reason controls with the member's previously
saved state for that event (or defaults to `attending` / empty reason if no
prior record exists).

#### Status options

**Sing-outs & Events cluster:**
- "I'll be there" (`attending`)
- "I'm not sure" (`not_sure`)
- "I can't be there" (`not_attending`)

**Rehearsals cluster:**
- "I'll be there" (`attending`)
- "I won't be there" (`not_attending`)
- `not_sure` is not offered for rehearsals

#### Reason field

- Appears and is active when status is `not_attending` or `not_sure`
- Hidden or disabled when status is `attending`
- Always optional — never required
- Pre-populated with previously saved reason when an event is selected and
  a prior record exists

#### Save behavior

- Save button writes the current status + reason for the selected event to
  Supabase (`event_attendance` table, upsert on `event_id` + `member_id`)
- On successful save: inline "Saved ✓" confirmation
- After save: `notify-attendance-change` Edge Function called with the change;
  member receives confirmation email; director receives summary for
  non-rehearsal events only

#### Dirty-state warning

If the member changes status or reason without saving and attempts to navigate
away or select a different event from the dropdown, a browser `confirm()` dialog
warns: "You have unsaved changes — leave anyway?" If the member confirms, changes
are discarded. If they cancel, they remain on the current event.

#### Database

All state lives in the `event_attendance` table (not `absences`):

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `event_id` | uuid FK → events | cascade delete |
| `member_id` | uuid FK → profiles | cascade delete |
| `status` | text NOT NULL | check: `attending` \| `not_sure` \| `not_attending` |
| `reason` | text | nullable |
| `updated_at` | timestamptz | default now() |

Unique constraint on `(event_id, member_id)`. No schema changes are needed for
the UI redesign.

#### Notification emails (as-built)

Handled by `notify-attendance-change` Supabase Edge Function, called by the
client after each batch save:
- Member always receives a confirmation email listing their saved choice
- Director (Chris Gabel) receives a summary for non-rehearsal events only;
  rehearsal changes are not reported to the director

#### Future work (not in scope for UI redesign)

- **Escalation pipeline** (pdt-issues.md #031): pg_cron job + `send-attendance-emails`
  Edge Function for 10-day `not_sure` reminder and 7-day auto-mark to `not_attending`
  with member + director notifications. Migration placeholder exists in
  `20260417_attendance.sql` but is commented out pending Edge Function deployment.
- **Admin attendance override** (pdt-issues.md #032): admin sets state on behalf
  of a member (e.g. Kevin transcribing clipboard absences). Lives in admin panel.
- **Sing-out attendance report** (pdt-issues.md #033): report showing all three
  voting states plus no-response members for any sing-out. Accessible to admin
  and musical_director roles.

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
| PDT_logo_vector.* | Vectorized PDT logo (SVG/EPS) | ✅ Delivered by Mercedes Gibson April 2026 |
| PDT_logo_words.* | "Words only" logo variant | ✅ Delivered by Mercedes Gibson April 2026 |

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
  ID: `REDACTED-see-Netlify-env-GOOGLE_DRIVE_MUSIC_FOLDER_ID`); served via Netlify Function + service account.
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
| Edge Functions | Netlify Edge Functions | env var injection (inject-env.js); streaming file downloads (drive-music-download.js) |
| Forms | Netlify Forms | No backend needed, free tier sufficient |
| Music Library | Google Drive + Netlify Function | Service account proxy; see §5g for full rationale |
| CMS (optional) | Decap CMS | Non-technical blog posting — Phase 3+ (unlikely to be implemented; member portal blog editor supersedes this) |
| Repo | GitHub | Version control, Netlify CI/CD integration |
| Email | Google Workspace for Nonprofits | ✅ Approved and active via Goodstack (2026-04-18) |
| Transactional Email | Resend (resend.com) | OTP codes + attendance notifications; noreply@pdtsingers.org; domain verified April 2026 |
| Domain | pdtsingers.org (already owned) | ✅ pdtsingers.org live on Netlify — DNS cutover complete |

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
- ✅ OTP login implemented — login.html email → code → verify flow; magic link code preserved behind flag
- ✅ OTP email template customized in Supabase dashboard — code display design using {{ .Token }}
- ✅ Attendance feature deployed — batch save + director/member notifications; admin census report
- ✅ Tech Maintainer's Guide — updated for OTP, attendance, Edge Function streaming

### Phase 2 — Public Site Complete
- ✅ Performances page (+ Netlify Form: booking inquiry)
- ✅ Our Music page
- ✅ Friends of PDT page
- ✅ Contact page (+ Netlify Form)
- ✅ Group photos available; photo carousel feature deferred (pdt-issues.md #014, #015)
- ⬜ Finalize all public copy — placeholder content live; real copy TBD
- [ ] SEO: meta tags, XML sitemap, Google Search Console

### Phase 3 — Polish & Launch
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing
- [ ] Final content review
- ✅ Populate Drive Music folders — complete April 2026; Dropbox retired

### Phase 4 — Post-Launch
- ✅ Google Workspace for Nonprofits — approved and active via Goodstack (2026-04-18)
- ✅ Migrate Music Library Drive share to Workspace Drive — complete April 2026
- ✅ Social media accounts live → Facebook page live April 2026
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
- [ ] Desired email addresses (info@, director@, members@, etc.)?
- [ ] Who is the second site maintainer (post-launch)?
- [ ] Should member Blog allow comments, or read-only initially?
- [ ] Duane Lundsten memorial — website placement TBD; memorial plaque approved and being procured
- ✅ Vectorized logo files delivered by Mercedes Gibson April 2026
- [ ] Attendance escalation pipeline (10-day nudges, 7-day auto-mark) — Issue #031, design pending
- ✅ Admin attendance override — DONE (pdt-issues.md #032, fixed 2026-04-25)
- ✅ Director attendance report — DONE (pdt-issues.md #033, fixed 2026-04-25)
- [ ] Groups.io for Friends of PDT — tabled; Google Workspace now active, can proceed when ready
- [ ] Music Library local dev testing — Music folder must be temporarily set to
      "Anyone with link" for local API key calls to work; revert after testing

---

## 12. Success Criteria

- Site live at pdtsingers.org with SSL, replacing GreenGeeks placeholder
- All public pages rendering correctly on mobile and desktop
- Member login working with admin approval flow (at least 2 test accounts)
- Contact, Join Us, and booking forms submitting via Netlify Forms
- ✅ Google Workspace for Nonprofits email active — approved via Goodstack (2026-04-18)
- At least one member blog post and one announcement visible to logged-in members
- Music Library functional: members can browse songs, download tracks and sheet music
