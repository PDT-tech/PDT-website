# PDT Singers Website — Requirements

**Last updated:** 2026-03-28  
**Status:** Draft — substantially complete; pending GitHub repo URL  
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
| Member Home | `/members` | Dashboard, recent posts, quick links |
| Leadership Blog | `/members/blog` | Posts from Chris, Kevin, and other leaders |
| Communications | `/members/comms` | Announcements, meeting notes |
| Resources | `/members/resources` | Sheet music, recordings, rehearsal schedules |
| Login | `/login` | Email magic link; new accounts require admin approval |

### 4.3 Utility
- **404** — Friendly error page in site style

---

## 5. Functional Requirements

### 5a. Authentication & Member Area
- Login via **Supabase** — magic link / email (no password to forget)
- Admin approval workflow:
  1. Prospective member submits interest form on /join
  2. Admin (Kevin / Grand Poohbah) receives email notification
  3. Admin approves in Supabase dashboard → member receives login link
  4. Approved member accesses /members area
  5. Unapproved visitors see "Pending approval" message
- Role-based: approved members see /members; others do not
- No self-registration — all accounts require admin approval

### 5b. Content Management
- Public content: hand-edited HTML files, updated by maintainer
- Member content: stored in Supabase (blog posts, announcements) — rendered via JS fetch
- **Decap CMS** (optional, Phase 3+): lets non-technical admin post without touching code
- Sheet music/resources: on Dropbox now; migrate to Google Drive once nonprofit approval received

### 5c. Email
- Group email via **Google Workspace for Nonprofits** (Google Groups)
- Free for 501(c)(3) orgs — apply via TechSoup
- ⚠️ **Blocked**: Requires IRS nonprofit approval letter — expected imminently at Chris Gabel's
  address. Does NOT block Phase 1 or Phase 2 site build.

### 5d. Social Media
| Platform | Plan | Notes |
|----------|------|-------|
| Facebook | Launch | Primary platform |
| Instagram | Launch | Secondary |
| YouTube | Phase 2 | Deferred until regular performances established |
| WBQA Facebook | Link only | `facebook.com/WBQA.Sings` — link from Friends page |

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

---

## 6. Brand & Visual Identity

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
- **Sheet music**: Dropbox now; migrate to Google Workspace after nonprofit approval
- **Duane Lundsten memorial**: TBD pending group discussion. Reserve placeholder in design.
  No action needed before Phase 1.

---

## 8. Leadership

### Chris Gabel — Director & Co-Founder
Active in the barbershop world since the 1990s; has sung in multiple award-winning quartets.
Previously directed the **Tualatin Valley Harmony Masters** in Hillsboro, OR. Had the original
vision for a daytime chorus; founding director of PDT Singers.

### Kevin Bier — Grand Poohbah (Admin Director) & Co-Founder
Began his barbershop journey in Boise, Idaho in 1980. Directed choruses in Boise and Boulder,
CO; on the founding team for the **Denver Tech Chorus**. He and Chris most recently sang
together in the quartet **7th Heaven** for nine years. Handles administration and serves as
assistant director.

### Other Leadership
| Name | Title | Role |
|------|-------|------|
| Grant Gibson | Nearly-Grand Poohbah | Leadership support |
| Sam Vigil | Poohbah-at-Large | Marketing |
| Ray Heller | Poohbah-at-Large | Chorus contact / outreach |
| Duane Lundsten † | Poohbah of Complex Stuff | In memoriam — our tech guy, passed March 2026 |

---

## 9. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Markup/Styles | Hand-coded HTML5 + CSS3 | Full control, no framework overhead |
| Interactivity | Vanilla JavaScript | Minimal JS needed; no framework required |
| Auth & DB | **Supabase** (free tier) | Member login, admin approval workflow, blog/post storage |
| Hosting | Netlify (free tier) | Free SSL, GitHub deploy, custom domain, Forms included |
| Forms | Netlify Forms | No backend needed, free tier sufficient |
| CMS (optional) | Decap CMS | Non-technical blog posting — Phase 3+ |
| Repo | GitHub | Version control, Netlify CI/CD integration |
| Email | Google Workspace for Nonprofits | Free via TechSoup; blocked on IRS letter |
| Domain | pdtsingers.org (already owned) | DNS to be pointed to Netlify at cutover |

**Monthly cost target:** Under $10/mo (likely free outside ~$12/yr domain renewal)

---

## 10. Build Phases

### Phase 1 — Foundation (Weeks 1–2)
- Set up GitHub repo and Netlify hosting; connect pdtsingers.org DNS
- Apply for Google Workspace for Nonprofits (once IRS letter in hand)
- Set up Supabase project for auth
- Design system: CSS variables, fonts, base components
- Build Home, About Us, and Join Us pages

### Phase 2 — Public Site Complete (Weeks 3–4)
- Build Performances, Our Music, Friends of PDT, and Contact pages
- Integrate Netlify Forms for contact, join interest, booking inquiry
- Upload group photos, finalize all public copy
- SEO: meta tags, XML sitemap, Google Search Console

### Phase 3 — Member Portal (Weeks 5–6)
- Implement Supabase auth: login, registration, admin approval flow
- Build /members dashboard, blog, comms, and resources pages
- Test end-to-end: new member applies → admin approves → member logs in
- Optionally add Decap CMS for non-technical blog posting

### Phase 4 — Handover & Training
- Document: how to post a blog, add a member, update the schedule
- Onboard second site maintainer
- Connect social media accounts to Friends page

---

## 11. Open Questions

- [x] Domain: pdtsingers.org at helpinghosting.com; GreenGeeks placeholder to be retired
- [x] Director name: **Chris Gabel** (confirmed)
- [x] Voice parts: TTBB barbershop chorus
- [x] Logos: all in hand
- [x] Rehearsal details: confirmed (see §7.3)
- [x] Charter: Lodge #18, WBQA Convention 2026, San Antonio TX
- [x] Photos: group photos available
- [x] Social media: Facebook + Instagram at launch; YouTube Phase 2
- [x] Tagline: "Music, Fellowship & Fun"
- [ ] **GitHub repo URL** — Kevin creating now
- [ ] Desired email addresses (info@, director@, members@, etc.)?
- [ ] Who is the second site maintainer (post-launch)?
- [ ] Should member Blog allow comments, or read-only initially?
- [ ] Duane Lundsten memorial — form and placement (pending group discussion)
- [ ] IRS nonprofit approval letter received? (triggers Google Workspace application)

---

## 12. Success Criteria

- Site live at pdtsingers.org with SSL, replacing GreenGeeks placeholder
- All public pages rendering correctly on mobile and desktop
- Member login working with admin approval flow (at least 2 test accounts)
- Contact, Join Us, and booking forms submitting via Netlify Forms
- Google Workspace for Nonprofits email active (post IRS letter)
- At least one member blog post and one announcement visible to logged-in members
