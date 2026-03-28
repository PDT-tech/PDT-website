# Portland DayTime Singers — Website

**pdtsingers.org** — Men's barbershop chorus, Portland Oregon. WBQA Lodge #18.

## Project Status

🚧 **In active development** — Phase 1 (Foundation)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Hand-coded HTML5 / CSS3 / Vanilla JS |
| Hosting | Netlify (free tier) |
| Auth & DB | Supabase (Phase 3) |
| Forms | Netlify Forms |
| Email | Google Workspace for Nonprofits |

## Local Development

No build step required — this is a static site. Open any HTML file directly in a browser, or use a simple local server:

```bash
# Python (built into macOS/Linux)
python3 -m http.server 8080

# Then open: http://localhost:8080
```

## Repository Structure

```
/
├── index.html              ← Home page
├── about.html              ← About Us (Phase 1)
├── music.html              ← Our Music (Phase 2)
├── performances.html       ← Performances (Phase 2)
├── join.html               ← Join Us (Phase 1)
├── friends.html            ← Friends of PDT (Phase 2)
├── contact.html            ← Contact (Phase 2)
├── login.html              ← Member login (Phase 3)
├── 404.html                ← Error page
├── members/
│   ├── index.html          ← Member dashboard (Phase 3)
│   ├── blog.html           ← Leadership blog (Phase 3)
│   ├── comms.html          ← Communications (Phase 3)
│   ├── resources.html      ← Resources / sheet music (Phase 3)
│   └── calendar.html       ← Chorus calendar (Phase 3)
├── css/
│   ├── reset.css           ← CSS reset
│   ├── variables.css       ← Design tokens (colors, type, spacing)
│   └── main.css            ← Base styles
├── js/
│   ├── supabase.js         ← Supabase client (Phase 3)
│   ├── members.js          ← Member area gating (Phase 3)
│   └── main.js             ← General UI
├── assets/
│   └── images/             ← Logos, photos
├── netlify.toml            ← Netlify config
└── README.md               ← This file
```

## Deployment

This site deploys automatically via Netlify on every push to `main`.

- **Production:** https://pdtsingers.org
- **Netlify project:** https://app.netlify.com/projects/astonishing-douhua-7cfbb7

## Maintainers

- Kevin Bier (Grand Poohbah / President) — primary
- TBD — secondary maintainer

## Documentation

See project docs (in your local folder, not committed to repo for privacy):
- `pdt-requirements.md` — full site requirements
- `pdt-session-context.md` — project decisions, progress, and session history
