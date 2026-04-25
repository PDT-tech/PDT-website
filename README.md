# PDT Singers Website

**Live site:** [pdtsingers.org](https://pdtsingers.org)  
**Repo:** https://github.com/kevin36v/PDT-website  
**Owner:** Kevin Bier · president@pdtsingers.org

Portland DayTime Singers (PDT Singers) is a men's barbershop chorus in Portland, Oregon — Lodge #18 of the Worldwide Barbershop Quartet Association (WBQA). This repo is the full source for the PDT Singers website.

---

## Stack

- **Hand-coded HTML5 / CSS3 / vanilla JS** — no framework, no build step
- **Netlify** — hosting, CI/CD, serverless functions, edge functions, forms
- **Supabase** — email/OTP authentication, PostgreSQL database, RLS, edge functions
- **Google Workspace Drive** — Music Library file storage (sheet music + learning tracks)
- **Google Cloud (pdt-singers-music-library)** — service account for Drive proxy
- **Resend** — transactional email (login OTP codes, attendance notifications)

---

## Local Development

```bash
cd ~/PDT-website
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser with dev tools open (cache disabled).

**Required:** `env.local.js` must be present in the repo root (gitignored). It sets `window.__PDT_ENV` with Supabase and Google Drive credentials. Never commit it. Ask Kevin for the values if you need them.

---

## Deploy

Netlify auto-publishing is **locked**. Pushes to GitHub do not auto-deploy.

1. Commit and push to `origin/main`
2. Netlify dashboard → Deploys → **Trigger deploy → Deploy site**
3. Verify live at pdtsingers.org

Do not unlock auto-publishing.

---

## Environment Variables

Credentials are never hardcoded. In production, `netlify/edge-functions/inject-env.js` injects them into every HTML response via `window.__PDT_ENV`. In local dev, `env.local.js` provides the same interface.

Set in **Netlify → Site configuration → Environment variables**:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `GOOGLE_DRIVE_API_KEY` | Drive API key (local dev reference only) |
| `GOOGLE_DRIVE_MUSIC_FOLDER_ID` | Music Library folder ID in Drive |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON (secret) |

Set in **Supabase → Edge Functions → Manage secrets**:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key for transactional email |
| `SITE_URL` | `https://pdtsingers.org` — used in email deep-links |

---

## Project Structure

```
pdtsingers/
├── index.html               ← Home (public)
├── about.html               ← About Us (public)
├── music.html               ← Our Music (public)
├── performances.html        ← Performances + booking form (public)
├── join.html                ← Join Us + interest form (public)
├── friends.html             ← Friends of PDT (public)
├── contact.html             ← Contact form (public)
├── login.html               ← OTP login (all visitors)
├── 404.html                 ← Custom 404
├── members/
│   ├── index.html           ← Member dashboard (auth-gated)
│   ├── directors-notes.html ← Director's Notes blog
│   ├── poohbah.html         ← Grand Poohbah's Prattlings blog
│   ├── events.html          ← Events blog
│   ├── sunburst.html        ← The Sunburst newsletter
│   ├── comms.html           ← Communications / announcements
│   ├── calendar.html        ← Chorus calendar + absence tracking
│   ├── music.html           ← Music Library
│   ├── attendance.html      ← Attendance self-declaration
│   └── resources.html       ← Member resources
├── netlify/
│   ├── edge-functions/
│   │   ├── inject-env.js           ← Injects env vars into HTML at runtime
│   │   └── drive-music-download.js ← Streams Drive file downloads (auth-gated)
│   └── functions/
│       └── drive-music.js          ← Drive proxy: folder + file listings
├── css/
│   ├── reset.css
│   ├── variables.css        ← Design tokens (palette, type, spacing)
│   ├── main.css             ← Global layout, nav, footer, hero
│   ├── members.css          ← Member portal layout
│   ├── blog.css             ← Blog page layout
│   └── calendar.css         ← Calendar page layout
├── js/
│   ├── supabase.js          ← Supabase client + auth helpers
│   ├── members.js           ← Member portal bootstrap (auth guard, profile load)
│   ├── nav.js               ← Hamburger menu
│   └── main.js              ← Public page JS
├── scripts/
│   └── populate-rehearsals.js  ← One-time Node script; run each December
├── assets/images/           ← Logo files
├── netlify.toml             ← Netlify config (edge functions, redirects, headers)
├── env.local.js             ← LOCAL DEV ONLY — gitignored, never commit
└── pdt-singers-music-library-*.json  ← gitignored service account key
```

---

## Key Docs

Detailed documentation lives in the repo root:

| File | Contents |
|------|---------|
| `pdt-tech-maintainers-guide.md` | Full maintainer reference — accounts, deploy, member management, Music Library, email, forms |
| `pdt-conventions.md` | Coding conventions — secrets, buttons, git, auth, modal pattern |
| `pdt-decisions.md` | Architecture decision log with rationale |
| `pdt-requirements.md` | Full site requirements and feature specs |
| `pdt-issues.md` | Open bugs and backlog (maintained by CC) |
| `pdt-calendar-spec.md` | Calendar feature spec |
| `pdt-photo-feature.md` | Photo gallery feature — planning stage |

---

## Member Roles

| Role | Who | Capabilities |
|------|-----|-------------|
| `admin` | Kevin Bier | Full access |
| `musical_director` | Chris Gabel | Director's Notes blog, calendar view |
| `calendar_manager` | Events coordinator | Create/edit events |
| `events_editor` | Social Media Manager | Events blog |
| `council_member` | High Council members | Member content |
| `member` | Active singers | Member content |

---

## Music Library

Sheet music and learning tracks live in Google Workspace Drive (`president@pdtsingers.org`). Members never interact with Google directly.

- **Listings:** `netlify/functions/drive-music.js` (serverless) — authenticates via service account JWT
- **Downloads:** `netlify/edge-functions/drive-music-download.js` (Deno Edge Function, `/api/music-download`) — streams Drive content directly to browser; no size ceiling; token never leaves server

Do not construct direct `drive.google.com` URLs in client code — they bypass the proxy and will 403.

**To add a song:** Create a folder in `Music/` named as you want it to appear. Drop in the PDF and MP3s. Done — the Music Library page picks it up automatically.

---

*PDT Singers · Lodge #18, WBQA · Music, Fellowship & Fun*
