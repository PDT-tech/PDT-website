# PDT Singers Website — Session Context

**Project:** PDT Singers website build  
**Last updated:** 2026-03-28  
**Requirements doc:** `pdt-requirements.md`

---

## About This Document

This file tracks what has been decided, what has been built, what's in progress, and what comes next. Paste the relevant sections into a new Claude session to resume work without re-explaining the project from scratch.

---

## Project Summary (paste this into any new session)

We are hand-coding a website for **Portland Daytime Singers (PDT Singers)**, a men's barbershop singing group in Portland, Oregon that performs free concerts for elderly residents in care facilities and recruits male singers. PDT Singers is **Lodge #18 of the Worldwide Barbershop Quartet Association (WBQA)**, co-founded by **Kevin Bier** (Grand Poohbah) and director **Chris Gabel**.

**Tech stack:**
- Hand-coded HTML5 / CSS3 / vanilla JavaScript — no frameworks, no WordPress
- Hosted on **Netlify** (free tier)
- Auth via **Netlify Identity** (member-only section, invite-only, role-based)
- Forms via **Netlify Forms**
- Source control on **GitHub**
- Email via **Google Workspace for Nonprofits** (separate from site)
- Domain already owned (name TBD in docs)

**Owner profile:** Experienced software/product executive (C++, 25+ years product leadership), light on database and web coding, fully capable of technical lifting with guidance.

**Design vibe:** Warm, community-focused, welcoming.

---

## Current Phase

**Phase 0 — Foundation & Requirements** ✅ In progress

---

## Phases & Milestones

### Phase 0 — Foundation (current)
- [x] Define goals, audience, site structure
- [x] Choose tech stack
- [x] Create `requirements.md`
- [x] Create `session-context.md`
- [ ] Resolve open questions (see requirements.md §9)
- [ ] Finalize site map / page list
- [ ] Lock design direction (palette, type, layout)

### Phase 1 — Scaffolding
- [ ] Create GitHub repo
- [ ] Set up Netlify project, connect to repo
- [ ] Point domain to Netlify
- [ ] Define folder structure and file naming conventions
- [ ] Create base HTML template (head, nav, footer, meta)
- [ ] Create base CSS (variables, reset, typography, layout grid)
- [ ] Deploy "coming soon" or skeleton site to verify pipeline works

### Phase 2 — Public Pages
- [ ] Home page
- [ ] About page
- [ ] Performances page
- [ ] Join Us page (with Netlify Form)
- [ ] Friends of PDT Singers page
- [ ] Contact page (with Netlify Form)
- [ ] 404 page

### Phase 3 — Member Area
- [ ] Netlify Identity setup (enable, configure invite-only)
- [ ] Login / logout UI
- [ ] Member home / dashboard page
- [ ] Communications page
- [ ] Blog page (read-only for members initially)
- [ ] Resources page (placeholder)
- [ ] Route protection via Netlify Identity JS widget

### Phase 4 — Polish & Launch
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (WCAG AA)
- [ ] SEO meta tags and OpenGraph
- [ ] Social media links (once accounts established)
- [ ] Cross-browser testing
- [ ] Final content review
- [ ] Launch

### Phase 5 — Post-Launch
- [ ] Google Workspace for Nonprofits setup (TechSoup application)
- [ ] Social media account creation
- [ ] Train site maintainer(s)
- [ ] Document update procedures

---

## Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-28 | Hand-coded HTML/CSS/JS, no framework | Owner preference, full control, no plugin debt |
| 2026-03-28 | Netlify for hosting | Free tier, GitHub integration, Identity + Forms included |
| 2026-03-28 | Netlify Identity for auth | Free, no DB needed, fits 10–30 member scale |
| 2026-03-28 | Invite-only member registration | Small known group, no public self-signup needed |
| 2026-03-28 | Google Workspace for Nonprofits for email | Free via TechSoup, proper email for org |

---

## Open Questions (mirror of requirements.md §9)

- [x] Domain: **pdtsingers.org**, registered at **helpinghosting.com**; current placeholder site on GreenGeeks (controlled by deceased member — son to deactivate once new site is live); DNS cutover needed at launch
- [ ] Desired email addresses (info@, members@, etc.)?
- [ ] Photos available, or start with stock imagery?
- [ ] Who are the 1–2 post-launch site maintainers?
- [ ] Should the member Blog allow comments, or read-only?
- [ ] Voice parts / ensemble type (TTBB, barbershop, etc.)?
- [ ] Existing logo or brand identity?
- [ ] Planned social media platforms?

---

## File/Folder Structure (planned — not yet created)

```
pdtsingers/               ← repo root
├── index.html            ← Home
├── about.html
├── performances.html
├── join.html
├── friends.html
├── contact.html
├── 404.html
├── members/
│   ├── index.html        ← Member dashboard (protected)
│   ├── communications.html
│   ├── blog.html
│   └── resources.html
├── css/
│   ├── reset.css
│   ├── variables.css
│   └── main.css
├── js/
│   ├── identity.js       ← Netlify Identity widget init
│   └── main.js
├── assets/
│   ├── images/
│   └── fonts/
└── netlify.toml          ← Netlify config (redirects, Identity protection)
```

---

## Notes & Context

- Performance concerts are **free** — this is a community service mission, not commercial
- Target singer recruit is likely men 40–75 who sang earlier in life and want to return to it
- "Friends of PDT Singers" is a distinct audience segment — supporters who aren't singers
- Google Workspace for Nonprofits requires TechSoup verification (~1–2 weeks); start this early
- Netlify Identity's `netlify-identity-widget` JS library handles login UI with minimal custom code
- Member content protection in Netlify is done via `netlify.toml` redirect rules + Identity JWT validation

---

## Session History

### Session 1 — 2026-03-28
- Defined project goals, audiences, site structure
- Chose tech stack (Netlify, hand-coded, Netlify Identity)
- Created `pdt-requirements.md` and `pdt-session-context.md`
- Confirmed domain: pdtsingers.org at helpinghosting.com; existing placeholder at GreenGeeks to be retired
- Confirmed logos exist (BW, color x2, WBQA lodge logo)
- Next: Answer remaining open questions, then Phase 1 scaffolding
