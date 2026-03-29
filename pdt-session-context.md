# PDT Singers Website — Session Context

**Project:** PDT Singers website build  
**Last updated:** 2026-03-28  
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
- Auth via **Supabase** (magic link, admin approval workflow, member content storage)
- Forms via **Netlify Forms**
- Source control on **GitHub** (repo URL TBD — Kevin creating)
- Email via **Google Workspace for Nonprofits** (blocked on IRS letter; doesn't block build)
- Optional: **Decap CMS** for non-technical blog posting (Phase 3+)

**Owner/maintainer:** Kevin Bier — experienced software/product exec (C++, 25+ yrs
product leadership at HP/Microsoft/Nike), light on DB and web coding, fully capable of
technical lifting with guidance.

**Design:** Palette from PDT logo watercolor wash (sky blues + cream + forest dark +
gold). Fonts: Playfair Display + Source Serif 4. Tone: warm, community-focused,
first-person plural. Tagline: "Music, Fellowship & Fun."

**Current phase:** Phase 0 complete → Phase 1 (Foundation) ready to start once GitHub
repo is created.

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
- [ ] Get GitHub repo URL from Kevin

### Phase 1 — Foundation / Scaffolding (current)
- [ ] Kevin creates GitHub repo → share URL
- [ ] Scaffold full file/folder structure in repo
- [ ] Set up Netlify project, connect to GitHub repo
- [ ] Configure custom domain (pdtsingers.org → Netlify)
- [ ] Set up Supabase project (auth + DB schema)
- [ ] Create base HTML template (head, nav, footer, meta)
- [ ] Create base CSS (variables, reset, typography, layout)
- [ ] Deploy skeleton site to verify pipeline end-to-end
- [ ] Apply for Google Workspace for Nonprofits (once IRS letter arrives)
- [ ] Build Home page
- [ ] Build About Us page
- [ ] Build Join Us page

### Phase 2 — Public Site Complete
- [ ] Build Performances page (+ Netlify Form: booking inquiry)
- [ ] Build Our Music page
- [ ] Build Friends of PDT page
- [ ] Build Contact page (+ Netlify Form)
- [ ] Upload group photos
- [ ] Finalize all public copy
- [ ] SEO: meta tags, XML sitemap, Google Search Console

### Phase 3 — Member Portal
- [ ] Supabase auth: login, admin approval flow, role gating
- [ ] Login page and flow
- [ ] Member dashboard (/members)
- [ ] Leadership Blog (/members/blog)
- [ ] Communications (/members/comms)
- [ ] Resources (/members/resources) — link to Dropbox initially
- [ ] End-to-end test: apply → approve → login → see member content
- [ ] Optional: Decap CMS for non-technical posting

### Phase 4 — Polish & Launch
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing
- [ ] Final content review
- [ ] DNS cutover: pdtsingers.org → Netlify (retire GreenGeeks)
- [ ] Notify deceased member's son to deactivate old site

### Phase 5 — Post-Launch
- [ ] Google Workspace for Nonprofits activation (once IRS letter + TechSoup)
- [ ] Migrate sheet music from Dropbox to Google Drive
- [ ] Social media accounts live → update Friends page links
- [ ] Onboard second site maintainer
- [ ] Document update procedures (blog post, add member, update schedule)

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
| 2026-03-28 | Netlify + Supabase confirmed as final hosting/auth stack | Evaluated LAMP/VPS (DigitalOcean, Hetzner, Neoserve) — rejected: unnecessary ops burden, no matching use case, free tier is genuinely sufficient. Decision is final. |
| 2026-03-28 | BHS non-affiliation stated on About page | Visitors may assume BHS connection; important to clarify |

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
- [ ] Desired email addresses?
- [ ] Second site maintainer?
- [ ] Member Blog: comments or read-only?
- [ ] Duane Lundsten memorial form/placement (group discussion pending)
- [ ] Lodge phone decision (affects contact info + business cards)
- [ ] Grant's prioritized landing page elements (input pending)
- [ ] Vectorized logo files (pending from Mercedes Gibson)
- [ ] Groups.io for Friends of PDT (tabled until Google Workspace live)

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
│   ├── index.html           ← Member dashboard (Supabase-gated)
│   ├── blog.html
│   ├── comms.html
│   └── resources.html
├── css/
│   ├── reset.css
│   ├── variables.css        ← All CSS custom properties (palette, type)
│   └── main.css
├── js/
│   ├── supabase.js          ← Supabase client init + auth helpers
│   ├── members.js           ← Member area gating + content fetch
│   └── main.js              ← General UI (nav, forms, etc.)
├── assets/
│   ├── images/
│   │   ├── PDT_logo_bw.png
│   │   ├── PDT_logo_color_1.jpeg
│   │   ├── PDT_logo_color_2.jpeg
│   │   └── WBQA_logo.png
│   └── fonts/               ← (if self-hosting; otherwise Google Fonts CDN)
├── netlify.toml             ← Netlify config: redirects, headers, form names
└── README.md                ← Repo overview + local dev instructions
```

---

## Key Reference Data

**Rehearsals:** Mondays 10:30am–12:30pm  
**Location:** 13420 SW Butner Rd, Beaverton OR 97005 (Westside United Methodist / Westside Journey UMC)  
**Voice placement:** Sing Happy Birthday in comfortable range — not an audition  
**First performance:** February 2026 at The Social Kitchen, Vancouver WA (2/6/2026)  
**Performance fee:** $150 standard 40-min performance; free for philanthropic/mission/recruitment  
**Current repertoire:** 8 songs (God Bless America just added)  
**WBQA:** sppbsqsus.org / facebook.com/WBQA.Sings  
**Charter:** Lodge #18, WBQA Annual Convention, San Antonio TX, March 14, 2026  
**GitHub repo:** https://github.com/kevin36v/PDT-website  
**Financials:** Banking at OnPoint Credit Union; $565 raised to date; 501(c)(3) confirmed  
**Sheet music:** Dropbox (temporary) → Google Workspace (IRS letter now in hand — apply now)  
**Lodge phone:** TBD — Kevin has phone to donate; Mint Mobile ~$180/yr; blocks business cards  

---

## Notes & Gotchas

- PDT Singers is **NOT BHS** — must be stated on About page; some visitors will assume BHS affiliation
- Duane Lundsten (Poohbah of Complex Stuff) passed March 2026 — memorial placeholder in design; no action before Phase 1
- WBQA lodge list page is nearly empty — no central directory driving traffic to lodge sites; PDT SEO work is important
- Supabase free tier is generous but has a 1-week inactivity pause policy — member activity should prevent this
- Netlify Forms free tier: 100 submissions/month — more than sufficient for this site
- Google Workspace nonprofit application takes 2–4 weeks via TechSoup after IRS letter in hand
- Director's name is **Gabel** (German spelling) — confirmed by Kevin. Earlier comp had "Gable" which was the typo.

---

## Session History

### Session 1 — 2026-03-28
- Defined project goals, audiences, site structure, tech stack
- Created initial pdt-requirements.md and pdt-session-context.md
- Confirmed domain, logos, rehearsal details, WBQA charter
- Reviewed homepage comp (PDT_Singers_Homepage_Comp.html) — palette, fonts, sections, SVG skyline confirmed
- Reviewed WBQA website (sppbsqsus.org) — charter context, tagline, Facebook, lodge structure
- Read and incorporated PDT_Singers_Site_Brief.md — major additions:
  - Supabase replaces Netlify Identity (admin approval workflow, magic link, DB)
  - Full leadership team documented (Gibson, Vigil, Heller, Lundsten †)
  - Our Music page added to sitemap
  - BHS non-affiliation noted — must be on About page
  - Google Workspace blocked on IRS letter (doesn't block build)
  - Sheet music on Dropbox temporarily
  - Director confirmed as **Chris Gabel** (German spelling — "Gable" in comp was a typo)
  - Kevin's and Chris's full bios captured
- ✅ Placeholder site pushed to GitHub and deployed to Netlify
- ✅ Fixed dark mode color flash on Firefox/Linux (Bazzite) — hardcoded hex colors with forced-color-adjust
- ✅ Netlify confirmed connected to github.com/kevin36v/PDT-website, auto-deploy on push
- ✅ Netlify DNS nameservers: dns1-4.p07.nsone.net — entered at helpinghosting.com
- ⏳ DNS propagation in progress — pdtsingers.org still on GreenGeeks, check whatsmydns.net
- Phase 1 scaffold complete and looking great
- ✅ Two key photos received and documented:
  - `IMG_5879.JPEG` — First sing-out at The Social Kitchen, Vancouver WA, 2/6/2026 (hero candidate)
  - `Chris_receiving_Lodge_certificate.jpg` — Chris Gabel receiving Lodge #18 charter at WBQA banquet,
    San Antonio, 3/14/2026. ⚠️ Certificate being reissued (WA/Brush Prairie errors → OR/Hillsboro)
- ✅ Read and incorporated BoD Meeting Minutes (3/26/2026, prepared by Grant Gibson). Key updates:
  - IRS 501(c)(3) letter IN HAND — Google Workspace application now unblocked
  - Performance fee policy: $150 standard; free for mission-aligned performances
  - Chorus Calendar added to member area sitemap
  - Vectorized logo files + "words only" version coming from Mercedes Gibson (Grant coordinating)
  - Lodge phone TBD (blocks business cards)
  - Social media deferred; website first; possible freelancer for social media
  - Kevin's formal title is President; Grant is Secretary/Treasurer
  - Repertoire at 8 songs; Christmas repertoire planning underway
  - Groups.io for Friends of PDT tabled until Google Workspace established
  - Grant to send Kevin prioritized landing page elements
  - Next BoD meeting: April 16, 10:00am
