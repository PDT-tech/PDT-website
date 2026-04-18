# PDT Singers — Tech Maintainer's Guide

**Last updated:** April 2026  
**Owner:** Kevin Bier (president@pdtsingers.org)  
**Site:** pdtsingers.org  
**Repo:** https://github.com/kevin36v/PDT-website

---

## 1. Overview

The PDT Singers website is a hand-coded HTML5/CSS3/vanilla JS site hosted on Netlify,
with Supabase handling authentication and member content storage. There is no build
step, no framework, no CMS. Updating the site means editing files and pushing to GitHub.

**Monthly cost:** ~$0 (domain renewal ~$12/yr is the only recurring expense)

---

## 2. Accounts & Access

| Service | URL | Login | What it controls |
|---------|-----|-------|-----------------|
| Netlify | netlify.com | GitHub (kevin36v) | Hosting, deploys, env vars, forms |
| Supabase | supabase.com | GitHub (kevin36v) | Auth, database, member accounts |
| GitHub | github.com/kevin36v | kevin36v | Source control, CI/CD |
| Google Cloud | console.cloud.google.com | president@pdtsingers.org | Music Library service account |
| Google Workspace | admin.google.com | president@pdtsingers.org | Email, Drive, Meet |
| Resend | resend.com | — | Transactional email (magic links) |
| Helping Hosting | — | — | Domain registrar (pdtsingers.org) |

⚠️ **All accounts should have a second owner added** — if Kevin is unavailable, no one
else can make changes. This is a known risk; add a backup owner when a second
maintainer is onboarded.

---

## 3. Local Development

```bash
cd ~/PDT-website
python3 -m http.server 8080
```

Open: http://localhost:8080

**Required:** `env.local.js` must be present in the repo root. This file is gitignored
and sets `window.__PDT_ENV` with Supabase and Google Drive credentials. Never commit it.

For Music Library local testing: temporarily set the Music folder in Google Drive to
"Anyone with link" (Viewer), test, then revert to Restricted. Don't forget to revert.

---

## 4. Deploy Workflow

Netlify auto-publishing is **locked** — pushes to GitHub do not auto-deploy.

**Standard deploy:**
1. Make changes locally, test at localhost:8080
2. Have CC commit and push to origin/main
3. Go to Netlify dashboard → Deploys → **Trigger deploy → Deploy site**
4. Wait for "Published" (usually under 30 seconds)
5. Verify live at pdtsingers.org
6. Auto-publishing stays locked — nothing further needed

**Do not unlock auto-publishing** unless you want every push to deploy immediately.
The manual deploy step is intentional — it preserves Netlify's 300 build credits/month
and prevents accidental deploys of work-in-progress commits.

---

## 5. Environment Variables

All credentials are injected at runtime by the Netlify edge function `inject-env.js`.
Never hardcode credentials in committed files.

| Variable | What it is | Where set |
|----------|-----------|-----------|
| `SUPABASE_URL` | Supabase project URL | Netlify env vars |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key | Netlify env vars |
| `GOOGLE_DRIVE_API_KEY` | Drive API key (local dev only) | Netlify env vars |
| `GOOGLE_DRIVE_MUSIC_FOLDER_ID` | Music folder ID in Drive | Netlify env vars |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON (secret) | Netlify env vars |

⚠️ **Finding Supabase API keys:** In the Supabase dashboard, go to Project Settings → API.
The page has two tabs. The keys used for this project (`SUPABASE_ANON_KEY` and the service
role key used in pg_cron jobs) are on the **Legacy** tab — not the default tab. The default
tab shows newer API key formats that are not what the site expects.

<!-- html-synced: 2026-04-18 — Supabase Legacy tab note added to §5 -->

To update: Netlify dashboard → Site configuration → Environment variables.
Changes take effect on next deploy.

---

## 6. Member Account Management

All accounts are admin-created. Members cannot self-register.

### Adding a new member

**Step 1 — Create the Supabase account**

1. Supabase dashboard → Authentication → Users
2. Click **Invite user**
3. Enter the member's email address and click **Send invitation**

Supabase sends a magic link invitation email. The member clicks it, lands on the
member portal, and is authenticated. No password required.

**Step 2 — Set role and profile fields**

After the account appears in Authentication → Users, open Table Editor → profiles
and find the new row (auto-created by trigger). Set:

| Field | Value |
|-------|-------|
| `role` | `member` (singers), `events_editor` (SMM/Events), `musical_director` (Chris), `admin` (Kevin) |
| `voice_part` | `Tenor`, `Lead`, `Baritone`, `Bass`, or `null` for non-singers |
| `full_name` | Member's full name |
| `is_active` | `true` |

Or use the SQL editor:

```sql
UPDATE profiles
SET role = 'member',        -- adjust as needed
    full_name = 'First Last',
    is_active = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'member@example.com'
);
```

**Step 3 — Verify**

Log in as the member (or ask them to confirm) that they can reach `/members/`
and see the correct content for their role.

### Roles reference

| Role | Access |
|------|--------|
| `admin` | Everything — all blogs, all member content, site management |
| `musical_director` | Director's Notes blog + all member content |
| `events_editor` | Events blog + all member content |
| `calendar_manager` | Calendar management + all member content |
| `member` | All member content, read-only |

### Deactivating a member

- Table Editor → profiles → set `is_active = false`
- Their login will be blocked. No need to delete the auth user.

---

## 7. Member Content (Blogs & Posts)

Blog posts are stored in the Supabase `posts` table. Members with appropriate roles
can post via the member portal UI. There is no external CMS.

**Blog → Role required to post:**
- Director's Notes → `musical_director` or `admin`
- Grand Poohbah's Prattlings → `admin` only
- Events Blog → `events_editor` or `admin`

Posts have a `published` boolean. Unpublished posts are only visible to the author
and admin. Published posts are visible to all authenticated members.

---

## 8. Chorus Calendar

Rehearsal events are auto-generated by a Supabase Edge Function
(`generate-rehearsals`) that runs weekly and creates Monday rehearsal events
12 weeks out. Default: 10:30am–12:30pm at Westside Journey UMC.

**To cancel a rehearsal:** find the event in the calendar UI (admin view) and mark
it as Cancelled. It will show struck-through on the calendar.

**To change rehearsal location temporarily:** edit the individual event in the
calendar UI.

**To change the default location permanently:** update the Edge Function in
Supabase dashboard → Edge Functions → generate-rehearsals.

### Year-End Rehearsal Population

`scripts/populate-rehearsals.js` is a standalone Node script run once each December
to bulk-load all Monday rehearsals for the coming year. It is **not** part of the site —
run it manually from the terminal.

**What it does:** deletes any existing Monday rehearsal events for the target year,
then inserts one event per Monday through December 31. Safe to re-run — the delete
step ensures no duplicates.

**Run command:**
```bash
SUPABASE_URL=https://your-project-ref.supabase.co \
SUPABASE_SERVICE_KEY=your-service-role-key \
node scripts/populate-rehearsals.js 2027
```

- `SUPABASE_URL` — find in Supabase dashboard → Project Settings → API → Project URL
- `SUPABASE_SERVICE_KEY` — find in Supabase dashboard → Project Settings → API → Service Role secret key (not the anon key)
- Year argument is optional; omit it to populate the current calendar year

**When to run:** each December, pass the coming year as the argument (e.g. `2027`).
The script skips past Mondays and only inserts from today forward when run mid-year.

---

## 9. Music Library

Sheet music and learning tracks are served from Google Drive via a Netlify serverless
function (`netlify/functions/drive-music.js`). Members never interact with Google
directly.

**Drive location:** `Music/` folder in president@pdtsingers.org Workspace Drive  
**Folder ID:** set in Netlify — project `pdtsingers.org` → Project configuration → Environment variables → `GOOGLE_DRIVE_MUSIC_FOLDER_ID`  
**Service account:** `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`

**To add a new song:**
1. Create a new folder inside `Music/` named exactly as you want it to appear
2. Drop in the PDF (sheet music) and MP3 learning tracks
3. That's it — the Music Library page picks it up automatically on next load

**File naming for learning tracks:** include the voice part in the filename
(Tenor, Lead, Bari/Baritone, Bass) so the page can sort the member's own part to the top.

---

## 10. Email (Magic Link Login)

Magic links are sent via Resend (resend.com), wired into Supabase SMTP.  
**From address:** noreply@pdtsingers.org  
**Template:** Supabase dashboard → Authentication → Email Templates → Magic Link

The link expires in 24 hours (TODO: reduce to 15 minutes — Supabase →
Authentication → Settings → OTP Expiry).

If members report not receiving login emails:
1. Check Resend dashboard for delivery status
2. Ask member to check spam folder
3. Verify their email address in Supabase matches exactly what they're entering

---

## 11. Forms

Public forms (Join Us, Contact, Performances booking inquiry) are handled by
Netlify Forms. Submissions appear in: Netlify dashboard → Forms.

Free tier limit: 100 submissions/month — more than sufficient.

Email notifications for form submissions can be configured in:
Netlify → Forms → [form name] → Form notifications.

---

## 12. Common Tasks Quick Reference

| Task | Where |
|------|-------|
| Add a member | Supabase → Authentication → Users |
| Deactivate a member | Supabase → Table Editor → profiles → is_active = false |
| Change a member's role | Supabase → Table Editor → profiles → role |
| Add a song to Music Library | Drop folder + files in Google Drive Music/ folder |
| Cancel a rehearsal | Calendar page (admin view) → mark Cancelled |
| View form submissions | Netlify → Forms |
| Update env variables | Netlify → Site configuration → Environment variables |
| Edit magic link email template | Supabase → Authentication → Email Templates |
| Trigger a deploy | Netlify → Deploys → Trigger deploy |
| View error logs | Netlify → Functions → drive-music → logs |

---

## 13. Architecture Summary

```
Browser
  └── pdtsingers.org (Netlify CDN)
        ├── Static HTML/CSS/JS files (GitHub repo)
        ├── inject-env.js (Netlify Edge Function)
        │     └── Injects SUPABASE_URL, SUPABASE_ANON_KEY, DRIVE credentials
        ├── drive-music.js (Netlify Function)
        │     └── Authenticates to Google Drive via service account
        │     └── Returns song/file listings to Music Library page
        └── Netlify Forms (public form submissions)

Authentication: Supabase (email → magic link via Resend SMTP)
Database: Supabase (profiles, events, absences, posts tables)
Music files: Google Workspace Drive (president@pdtsingers.org)
Domain: pdtsingers.org at Helping Hosting → Netlify DNS
```

---

## 14. Known Issues & Backlog

- [ ] Cap OTP expiry at 15 minutes (currently 24 hours)
- [ ] "Resend link" button on magic link confirmation state ✅ done
- [ ] Disable password auth in Supabase (magic link confirmed working)
- [ ] env.local.js console error in production (nosniff header blocking onerror suppression) — benign
- [ ] Calendar polish: prev/next arrows, detail panel on load, mobile layout
- [ ] Add second account owner to all services
- [ ] Onboard Moss Egli — Supabase account, events_editor role, Facebook setup
- [ ] Populate Music Library Drive folders from Dropbox
- [ ] Build members/whats-new.html (member-facing changelog)
- [ ] Finalize public page content (About, Join, Performances, etc.)

---

*PDT Singers · pdtsingers.org · Lodge #18, WBQA · Music, Fellowship & Fun*
