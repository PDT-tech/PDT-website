# PDT Singers — Coding Conventions

**Read this file at the start of every CC session before touching any code.**

---

## Secrets & Credentials

**Never hardcode secret values in committed files. Ever.**

All credentials and IDs are injected at runtime via `window.__PDT_ENV`. Always
reference the variable name — never the literal value.

```js
// CORRECT
const folderId = window.__PDT_ENV?.GOOGLE_DRIVE_MUSIC_FOLDER_ID

// WRONG — will trigger Netlify secret scanning and fail the build
// (value below is illustrative only — not a real secret)
const folderId = 'aB3xK9mNpQ7rTvWy2ZdLhE5cFgJuRsX1'
```

Secrets live in exactly two places:
1. `env.local.js` — local dev only, gitignored, never committed
2. Netlify environment variables — production, set in the Netlify dashboard

This applies to: Supabase URL, Supabase anon key, Google Drive folder ID, Google
Drive API key, Google service account JSON. No exceptions.

**Never write real secret values in documentation or code examples.** Use synthetic
placeholders (e.g. `aB3xK9mNpQ7r`) and add a comment noting the value is illustrative
only — the real value is in Netlify (Project configuration → Environment variables)
or the relevant service dashboard.

---

## Buttons & CTAs

**All buttons and CTA links must have a visible, correctly-styled default/resting state.**
Never rely on hover to reveal the intended color. The correct resting style for `.btn-primary`
and `.nav-cta` is a light/sky background with dark text (`var(--forest)`). Hover deepens to
`var(--sky-deep)` with white text.

**Dark mode trap:** `var(--sky)` is overridden to `#0d1f2d` (near-black) in dark mode for
the hero gradient. Never use `var(--sky)` as a button background in CSS — it will appear
dark on dark-mode systems. The dark mode section of `main.css` explicitly overrides button
backgrounds to `var(--sky-mid)`, which is tuned for dark mode readability. Light mode uses
`var(--sky)` via the default rule; dark mode uses `var(--sky-mid)` via the media query override.

Exceptions that are intentionally dark or colored in their resting state:
- `.btn-forest` — dark forest background, used for modal save/confirm actions
- `.btn-danger` — red background, used for destructive actions
- `#submit-btn` — gold, login page only
- `.cal-nav-btn` / `.cal-today-btn` — white-on-dark, live inside the dark calendar header band

**When generating any new page, verify button default state before committing.** Do not
commit a page where buttons require hover to show their intended color.

**Dark mode trap — `var(--white)`:** In dark mode `--white` overrides to `#1e1c18`
(near-black). Never use `var(--white)` for text on a permanently-dark background such as
`.page-hero` (dark forest gradient) or `.site-footer`. Use `#ffffff` or a hardcoded
`rgba(255,255,255,…)` instead so the color is immune to the dark mode token override.

---

## Git & Commits

**Every file delivered for git check-in gets a complete commit message. No exceptions.**

Commit message format:
```
Short imperative summary (50 chars max)

Longer explanation of what changed and why. Mention files touched.
Reference any issue or backlog item if relevant.
```

**Always push to origin/main after committing.** Never leave commits local.

`env.local.js` is gitignored — never commit it, never reference it in commit messages.

---

## Environment & Auth

- `window.__PDT_ENV` is injected by `netlify/edge-functions/inject-env.js` in
  production and by `env.local.js` in local dev
- Check for its presence before using: `window.__PDT_ENV?.SUPABASE_URL || ''`
- Log a console error if credentials are missing — see `js/supabase.js` for the pattern

**Auth is magic-link-only.** `signInWithPassword` remains in `supabase.js` with a
TODO comment but is not used. Do not wire it up to any UI.

---

## Role Visibility Pattern

Use `applyRoleVisibility()` checking `window.__PDT_USER` directly. Do not rely solely
on the `pdt:profile-loaded` event — it has a timing race condition.

```js
// CORRECT — check window.__PDT_USER directly first, fall back to event
function applyRoleVisibility() {
  if (window.__PDT_USER) {
    _applyRoles(window.__PDT_USER)
  } else {
    document.addEventListener('pdt:profile-loaded', e => _applyRoles(e.detail))
  }
}
```

---

## Modal Overlays

Use the `modal-hidden` CSS class to show/hide modals. Never use the HTML `hidden`
attribute on modal elements.

```js
// CORRECT
modal.classList.remove('modal-hidden')
modal.classList.add('modal-hidden')

// WRONG
modal.hidden = true
modal.setAttribute('hidden', '')
```

---

## Netlify Deploy

Auto-publishing is **locked**. Pushes to GitHub do not auto-deploy.

- Do not unlock auto-publishing
- Deploys are triggered manually from the Netlify dashboard
- One manual deploy per day max unless there's a specific reason for more

---

## File Naming

- General project docs: prefix with `pdt-` (e.g. `pdt-requirements.md`)
- Agenda files: `Agenda_High_Council_YYYYMMDD.docx` (meeting date, not production date)
- Never commit `env.local.js`

---

## Director Name

The director's name is **Chris Gabel** — German spelling. Not "Gable". This appears
on the About page, blog attribution, and anywhere the director is mentioned.

---

## Music Library Local Dev

When testing the Music Library locally:
1. Temporarily set the Google Drive Music folder to "Anyone with link" (Viewer)
2. Test
3. **Revert to Restricted immediately** — do not leave it open
