# PDT Singers Website — Requirements

**Last updated:** 2026-03-28  
**Status:** Draft — in active definition

---

## 1. Project Overview

Build and deploy a hand-coded website for **Portland Daytime Singers (PDT Singers)**, a men's barbershop singing group in Portland, Oregon whose primary mission is performing free concerts for elderly residents in care facilities, and growing membership among men who want to sing.

PDT Singers is **Lodge #18 of the Worldwide Barbershop Quartet Association (WBQA)**. The group was co-founded by **Kevin Bier** (Grand Poohbah) and director **Chris Gabel**.

---

## 2. Goals & Purpose

| # | Goal | Primary Audience |
|---|------|-----------------|
| 1 | Raise awareness of performances and the group's mission | General public, care facility staff |
| 2 | Attract male singers to join the group | Men interested in singing |
| 3 | Provide member-only content behind a login | Current PDT Singers members |
| 4 | "Friends of PDT Singers" content and social media pointers | Supporters, fans, family |
| 5 | Support group email infrastructure | Members, leaders |

---

## 3. Audience Personas

### 3a. Prospective Member
- A man (likely 40–75) who enjoys singing or used to sing
- Looking for a low-pressure, community-oriented group
- Wants to know: What do you sing? When do you meet? Do I need to audition? What's the commitment?

### 3b. General Public / Care Facility Contact
- Family of residents, facility activity directors, community members
- Wants to know: Who are you? Where do you perform? How do I book you or attend?

### 3c. Current Member
- Logged-in access to communications, announcements, blog posts from leaders
- Needs to be simple and reliable — not all members are tech-savvy

### 3d. Friend of PDT Singers
- Supporter or fan who wants to follow the group
- Needs pointers to social media, upcoming performances, news

---

## 4. Site Structure (Pages)

### Public Pages
- **Home** — Hero with mission statement, warm photo/imagery, calls to action (Join Us / See Us Perform)
- **About** — Who we are, history, values, what makes PDT Singers unique
- **Performances** — Upcoming and past performances; how to request/book a performance
- **Join Us** — Targeted at prospective male singers; FAQ, what to expect, contact/interest form
- **Friends of PDT Singers** — News, social media links, how to support
- **Contact** — General contact form or email link

### Member-Only Pages (behind login)
- **Member Home / Dashboard** — Latest announcements and recent posts at a glance
- **Communications** — Leader-to-member announcements
- **Blog** — Posts from leaders and members
- **Resources** — (TBD) sheet music, schedules, documents

### Utility
- **Login / Logout** — Netlify Identity UI
- **404** — Friendly error page

---

## 5. Functional Requirements

### 5a. Authentication & Member Area
- Login via **Netlify Identity** (email + password, no social login required initially)
- Role-based: `member` role gates member-only pages
- Logout available from member area nav
- Password reset via email (Netlify Identity handles this)
- No self-registration — admin invites members manually (fits 10–30 member scale)

### 5b. Content Management
- Public content: hand-edited HTML files, updated by site maintainer
- Member content: Markdown files or simple HTML files in a protected directory
- No CMS required at launch; revisit if content volume grows
- Weekly-ish update cadence — no real-time or database-driven content needed

### 5c. Email
- Group email to be handled via **Google Workspace for Nonprofits**
- Free tier available through TechSoup (up to 50 users)
- Website to display contact addresses once established
- Setup documented separately (see `session-context.md`)

### 5d. Social Media
- Placeholder sections for social media links on Friends page and footer
- Accounts TBD — links added once established
- Platforms likely: Facebook, Instagram (TBD by group)

### 5e. Forms
- "Join Us" interest form — name, email, voice part (optional), message
- Contact form — name, email, message
- Form handling via **Netlify Forms** (free tier: 100 submissions/month — more than sufficient)

### 5f. Performance / SEO
- Fast-loading static site — no heavy frameworks
- Semantic HTML for accessibility and SEO
- Meta descriptions and OpenGraph tags on key pages
- Mobile-responsive design

---

## 6. Design Direction

- **Vibe:** Warm, community-focused, welcoming — not corporate or stuffy
- **Palette:** TBD — likely warm tones (golds, deep reds, earthy neutrals) evoking music and community; to be finalized in design phase
- **Typography:** Readable, friendly — likely a serif for headings (musical/classic feel), clean sans-serif for body
- **Imagery:** Real photos of the group performing preferred; placeholder stock imagery at launch if needed
- **Accessibility:** WCAG AA target — good contrast, readable font sizes, keyboard navigable

---

## 7. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Markup/Styles | Hand-coded HTML5 + CSS3 | Full control, no framework overhead |
| Interactivity | Vanilla JavaScript | Minimal JS needed; no framework required |
| Auth | Netlify Identity | Free ≤1,000 users, handles roles, password reset, no DB needed |
| Hosting | Netlify | Free tier, GitHub deploy, custom domain, HTTPS, Forms included |
| Forms | Netlify Forms | No backend needed, free tier sufficient |
| Repo | GitHub | Version control, Netlify CI/CD integration |
| Email | Google Workspace for Nonprofits | Free via TechSoup, up to 50 users |
| Domain | Already owned | To be pointed to Netlify |

**Monthly cost target:** Under $10/mo (likely free outside ~$12/yr domain renewal)

---

## 8. Out of Scope (v1)

- E-commerce / donations (revisit if needed)
- Event ticketing
- Online sheet music streaming
- Member-to-member messaging
- Mobile app

---

## 9. Open Questions

- [x] Domain: **pdtsingers.org**, currently registered at **helpinghosting.com**
- [ ] What email addresses are desired (e.g. info@, members@)?
- [ ] Do we have photos of the group, or do we start with stock imagery?
- [ ] Who are the 1–2 site maintainers post-launch?
- [ ] Should the Blog allow comments, or is it read-only for members?
- [ ] Voice parts — is PDT Singers TTBB, SATB subset, barbershop, other?
- [ ] Is there an existing logo or brand identity to work from?
- [ ] What social media platforms are planned?

---

## 10. Success Criteria

- Site live at custom domain with SSL
- All public pages rendering correctly on mobile and desktop
- Member login working for at least 2 test accounts
- Contact and Join Us forms submitting to Netlify Forms
- Google Workspace for Nonprofits email active
- At least one member blog post / announcement visible to logged-in members
