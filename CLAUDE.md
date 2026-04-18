# CLAUDE.md — Standing Instructions for CC (Claude Code)
# PDT Singers Website Project
# Read automatically by CC at startup. Do not delete.

---

## Issue Tracker Ownership

CC reads `pdt-conventions.md` and `pdt-decisions.md` at the start of every session before touching any code.

CC is the sole maintainer of `pdt-issues.md` in the repo root.

**Rules:**

1. **When fixing a known issue:** Update its status from `OPEN` to `DONE` and append
   the fix date in the same commit as the code change. Do not make a separate commit.
   Format: `005 | DONE   | [original description]. Fixed YYYY-MM-DD.`

2. **When claude.ai hands you a new issue entry:** Append it to `pdt-issues.md` and
   commit immediately. CC will be given the exact line to append — copy it verbatim.
   Assign the next sequential issue number.

3. **Never reformat, reorder, or clean up `pdt-issues.md`** without explicit instruction
   from Kevin. The flat format is intentional.

4. **Never upload `pdt-issues.md` to Project Memory** — CC's copy in the repo is the
   single source of truth. claude.ai reads it via `cat pdt-issues.md` when needed.

---

## Commit Discipline

- Every commit that touches `pdt-issues.md` must include it in the same commit as the
  related code change (not a separate commit), unless the change is issues-only
  (e.g. appending a new issue from claude.ai).
- Always push to origin after committing. Unstaged changes before a Netlify deploy
  cause build failures.

---

## General Project Conventions

- **No frameworks, no build step.** Hand-coded HTML5/CSS3/vanilla JS only.
- **Never commit `env.local.js`** — it is gitignored and contains local credentials.
- **Never hardcode real credentials** in any file. All secrets live in Netlify
  environment variables (production) or `env.local.js` (local dev only).
- **Role visibility:** Use `applyRoleVisibility()` checking `window.__PDT_USER`
  directly — do not rely solely on the `pdt:profile-loaded` event (timing race).
- **Modal overlays:** Use `modal-hidden` CSS class to hide/show. Never use the HTML
  `hidden` attribute on modals.
- **Netlify auto-publish is always locked.** Kevin manually publishes. Never unlock it.
- **Sing-outs, not concerts.** PDT performs sing-outs. Use this term consistently.

---

## Key File Locations

| File | Purpose |
|------|---------|
| `pdt-issues.md` | Issue tracker — CC-owned |
| `pdt-requirements.md` | Requirements and decisions — claude.ai/Kevin-owned |
| `pdt-session-context.md` | Session handoff doc — claude.ai/Kevin-owned |
| `css/variables.css` | Design tokens |
| `js/supabase.js` | Supabase client and auth helpers |
| `env.local.js` | Local credentials — GITIGNORED, never commit |
