# PDT Singers — Tech Maintainer's Guide

**Last updated:** 2026-04-25  
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

⚠️ **CRITICAL: Kevin is currently the sole owner of every service listed above.**
If Kevin is unavailable for any reason, no one else can make changes to the site,
member accounts, DNS, or any other system. This is an unacceptable single point of
failure for a functioning chorus.

**Action required — add a second admin to every service:**
- [ ] Netlify — add second owner (Site settings → Team)
- [ ] Supabase — add second owner (Project settings → Team)
- [ ] GitHub — add second owner (repo Settings → Collaborators)
- [ ] Google Cloud Console — add second owner to pdt-singers-music-library project
- [ ] Google Workspace admin — add second admin (admin.google.com)
- [ ] Resend — add second owner (Team settings)
- [ ] Helping Hosting (domain registrar) — add second account or document recovery path
- [ ] TechSoup (soon to be Goodstack) — add second contact

The backup admin should be a board member (Grant Gibson is the natural candidate as
Secretary-Treasurer) or a trusted technical contact. They do not need to know how to
use these systems day-to-day — they just need access so they can hand off to a future
maintainer if needed.

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
The manual deploy step is intentional — it prevents accidental deploys of
work-in-progress commits and conserves build credits.

**Netlify build credits:** The site is on the Personal plan ($9/month), which includes
1,000 build credits/month. Each production deploy costs approximately 15 credits (~65
deploys/month before hitting the ceiling). That's generous for normal maintenance but
easy to burn during active development if you deploy after every small change.
Mitigation: test all changes on localhost:8080 before deploying. Batch related changes
into a single deploy. During active feature work, one deploy per working session is a
reasonable target unless something is genuinely broken in production.

---

## 5. Environment Variables

Credentials are injected at runtime by the Netlify edge function `inject-env.js`.
Never hardcode credentials in committed files.

**Netlify environment variables** (set in Netlify → Site configuration → Environment variables):

| Variable | What it is |
|----------|-----------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `GOOGLE_DRIVE_API_KEY` | Drive API key (local dev only) |
| `GOOGLE_DRIVE_MUSIC_FOLDER_ID` | Music folder ID in Drive |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON (secret) |

**Supabase Edge Function secrets** (set in Supabase → Edge Functions → Manage secrets):

| Variable | What it is |
|----------|-----------|
| `RESEND_API_KEY` | Resend API key for transactional email from Edge Functions |
| `SITE_URL` | `https://pdtsingers.org` — used in email deep-links |

⚠️ **Important distinction:** Netlify env vars and Supabase Edge Function secrets are separate systems. Do not mix them up. Netlify vars are for production environment injection and Netlify Functions. Supabase secrets are for Edge Functions that send transactional email.

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
| `role` | `member` (singers), `council_member` (High Council), `events_editor` (SMM/Events), `musical_director` (Chris), `calendar_manager` (events coordinator), `admin` (Kevin) |
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

| Role | Assigned to | Calendar | Poohbah's Prattlings | Director's Notes | Events Blog | Member content |
|------|-------------|----------|----------------------|------------------|-------------|----------------|
| `admin` | Kevin Bier | Full CRUD | Post (any author) | Post (any author) | Post (any author) | Full access |
| `council_member` | Grant Gibson + any HC member Kevin designates | Read only | Post own entries | — | — | Full access |
| `musical_director` | Chris Gabel | Read only | — | Post own entries | — | Full access |
| `calendar_manager` | Future social coordinator or non-member volunteer | Full CRUD | — | — | — | Full access |
| `events_editor` | Moss Egli (SMM) + Wives Auxiliary, etc. | Read only | — | — | Post own entries | Full access |
| `member` | All active PDT Singers | Read + mark absences | — | — | — | Full access |

**Notes:**
- "Post own entries" means the role can create, edit, and delete only posts they authored. Admin can edit or delete any post.
- `calendar_manager` can create, edit, and delete any calendar event. No blog posting rights.
- Non-singing roles (`calendar_manager`, `events_editor`) have `voice_part = null`.
- To assign a role, see Step 2 above.

### Deactivating a member

- Table Editor → profiles → set `is_active = false`
- Their login will be blocked. No need to delete the auth user.

---

## 7. Member Content (Blogs & Posts)

Blog posts are stored in the Supabase `posts` table. Members with appropriate roles
can post via the member portal UI. There is no external CMS.

**Blog → Role required to post:**
- Director's Notes → `musical_director` or `admin`
- Grand Poohbah's Prattlings → `council_member` or `admin`
- Events Blog → `events_editor` or `admin`
- The Sunburst → `admin` only (newsletter_editor role reserved for future use)

Non-admin authors can only edit and delete their own posts. Admins can edit and delete any post by any author.

Posts have a `published` boolean. Unpublished posts are only visible to the author
and admin. Published posts are visible to all authenticated members.

---

## 8. Chorus Calendar & Attendance

### Calendar

Rehearsal events are auto-generated by a Supabase Edge Function
(`generate-rehearsals`) that runs weekly and creates Monday rehearsal events
12 weeks out. Default: 10:30am–12:30pm at Westside Journey UMC.

**To cancel a rehearsal:** find the event in the calendar UI (admin view) and mark
it as Cancelled. It will show struck-through on the calendar.

**To change rehearsal location temporarily:** edit the individual event in the
calendar UI.

**To change the default location permanently:** update the Edge Function in
Supabase dashboard → Edge Functions → generate-rehearsals.

### Attendance ("Can You Be There?")

Members declare their attendance intent at `/members/attendance.html`. The page
has two columns: rehearsals (left) and sing-outs/events (right).

**Rehearsals:** members are assumed attending unless they say otherwise — same
model as the existing absence feature.

**Sing-outs and non-rehearsal events:** three-state status —
`attending` / `not_sure` / `not_attending`. Members can update their status
any time before the event. Status is stored in the `event_attendance` table.

**Batch save:** Members make local selections (dropdowns on the page); a single
"Save" button batch-writes all changed rows to Supabase. On success, shows
"Saved ✓" confirmation.

**Notification on save:** A Supabase Edge Function (`notify-attendance-change`)
fires after the Save succeeds and:
- Sends the musical director an email with the member's status summary
- Sends the member a confirmation email (includes full event details if attending)
- Director email includes a deep-link to the admin attendance census report
  for that event

**Admin census report:** `/members/admin-attendance.html` — visible to
`admin` and `musical_director` roles only. Shows attending / not sure /
can't make it / no response for each upcoming event. Accepts `?event=<uuid>`
deep-link from director notification emails.

**Event fields used by attendance:** When creating or editing a non-rehearsal
event, fill in `call_time`, `address`, `dress_code`, and `parking_notes` in
addition to the standard fields — these appear on member attendance cards and
in confirmation emails. `address` is the street address (used for the Google
Maps link); `location` is the human-readable venue name.

**Deferred features** (see pdt-issues.md #031–#033):
- Escalation pipeline: 10-day nudge emails reminding members with `not_sure` status to commit; 7-day auto-mark to `not_attending` with director notification
- Admin override: Kevin entering clipboard attendance marks from rehearsals
- Attendance report: director-facing census with voting breakdown and no-response tracking

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

Sheet music and learning tracks are served from Google Workspace Drive
(`president@pdtsingers.org`). The Music Library is fully populated. Members never
interact with Google directly.

**Drive location:** `Music/` folder in president@pdtsingers.org Workspace Drive  
**Folder ID:** set in Netlify — Site configuration → Environment variables → `GOOGLE_DRIVE_MUSIC_FOLDER_ID`  
**Service account:** `pdt-music-library@pdt-singers-music-library.iam.gserviceaccount.com`

**How downloads work:**
- **Folder and file listings** — `netlify/functions/drive-music.js` (serverless). Returns JSON; no file content passes through.
- **File downloads** — `netlify/edge-functions/drive-music-download.js` (Deno Edge Function, `/api/music-download`). Streams file content directly from Drive to the browser — no buffering, no size ceiling, service account token never leaves the function.

Do not construct direct `drive.google.com` download URLs in client code — they bypass the service account and will 403.

**File size note:** keep individual files under ~6MB raw (~4.5MB before base64 expansion) as a soft guideline for audio quality and load time. Very large MP3s at high bitrate are worth compressing.

**To add a new song:**
1. Create a new folder inside `Music/` named exactly as you want it to appear on the page
2. Drop in the PDF (sheet music) and MP3 learning tracks
3. That's it — the Music Library picks it up automatically on next load

**File naming for learning tracks:** include the voice part in the filename
(Tenor, Lead, Bari/Baritone, Bass) so the page sorts the member's own part to the top.

---

## 10. Email (OTP Login)

Login codes (6-digit OTP) are sent via Resend (resend.com), wired into Supabase SMTP.

**From address:** noreply@pdtsingers.org  
**Resend domain:** pdtsingers.org — verified April 2026  
**OTP expiry:** 24 hours (TODO: reduce to 15 minutes — set in Supabase → Authentication → Settings → OTP Expiry = 1440s)  
**Template:** Supabase dashboard → Authentication → Email Templates → Magic Link (code display template)

**Login flow:**
1. Member enters email address
2. Clicks "Send me a login code"
3. Receives 6-digit numeric code by email
4. Enters code on verify screen
5. Redirected to `/members/`

**Security detail:** The auth call uses `shouldCreateUser: false`, which means Supabase
will only send a code to accounts that already exist in the system. Strangers entering
a random email get no response — no code, no error, no confirmation. This is intentional.

**Magic link code:** Code to switch back to magic links is preserved in `login.js` behind
`const USE_MAGIC_LINKS = false`. Do not enable without explicit direction from Kevin.
Magic link route uses `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`
with email delivery method instead of OTP.

If members report not receiving login codes:
1. Check Resend dashboard for delivery status
2. Ask member to check spam folder
3. Verify their email address in Supabase matches exactly what they're entering
4. Confirm their account has `is_active = true` in the profiles table

**Transactional email for attendance notifications** also routes through Resend, triggered
by Supabase Edge Functions (not Supabase SMTP). The `RESEND_API_KEY` for this is stored
in Supabase Edge Function secrets, not Netlify env vars.

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
| View attendance census | Members portal → Attendance Report (admin/director only) |
| Check Edge Function logs | Supabase → Edge Functions → [function name] → logs |
| View form submissions | Netlify → Forms |
| Update env variables | Netlify → Site configuration → Environment variables |
| Edit magic link email template | Supabase → Authentication → Email Templates |
| Trigger a deploy | Netlify → Deploys → Trigger deploy |
| View Music Library logs | Netlify → Functions → drive-music (listings) or Edge Functions → drive-music-download (downloads) |

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
        ├── drive-music-download.js (Netlify Edge Function — /api/music-download)
        │     └── Streams Drive file content directly to browser
        │     └── No buffering, no size ceiling; token never leaves function
        └── Netlify Forms (public form submissions)

Authentication: Supabase (email → OTP code via Resend SMTP; shouldCreateUser: false)
Database: Supabase (profiles, events, absences, event_attendance, posts tables)
Edge Functions: Supabase
  ├── generate-rehearsals — weekly cron; creates Monday rehearsals 12 weeks out
  ├── notify-attendance-change — database trigger; fires on event_attendance upsert
  └── send-attendance-emails — nightly cron; 10-day nudge emails (deferred, Issue #031)
Music files: Google Workspace Drive (president@pdtsingers.org)
Email (transactional): Resend (resend.com)
  — OTP code delivery via Supabase SMTP (currently active)
  — Attendance notifications via Edge Function direct API calls
Email (group): Google Workspace Gmail + Groups
Domain: pdtsingers.org at Helping Hosting → Netlify DNS
GCP project: pdt-singers-music-library (service account for Drive proxy)
```

---

## 14. Known Issues & Backlog

Issues are tracked in `pdt-issues.md` in the repo root, maintained by CC.
Run `cat pdt-issues.md` to see the current list.

### Deferred Attendance Features (Issues #031–#033)

Three post-launch features are planned for the attendance system:

**#031 (FWI-A) — Escalation pipeline**: 10-day nudge emails reminding members with `not_sure` status to commit either way; 7-day auto-mark to `not_attending` with director notification; requires new `send-attendance-emails` Edge Function and pg_cron job setup in Supabase.

**#032 (FWI-B) — Admin override**: Kevin entering clipboard attendance marks from in-person rehearsals; new admin form at `/members/admin-attendance-override.html` or integrated into admin panel; upserts to same `event_attendance` table; notifies director same as member saves.

**#033 (FWI-C) — Attendance report**: Director-facing census view for any sing-out showing all three voting states plus members who haven't responded; can be a dedicated report page or integrated into admin panel.

---

## 15. Claude.ai MCP Connectors

Claude.ai (the chat interface used for all PDT website work) supports MCP connectors that give Claude direct access to external services — Google Drive, Gmail, Stripe, and others. The PDT project has evaluated the available connectors.

**Connector status as of April 2026:**

| Connector | Status | When useful |
|-----------|--------|------------|
| Google Drive | Disconnected | Not needed for website work — CC reads all files via the repo. Re-enable only if you want claude.ai to directly browse or read files from the PDT Workspace Drive during a planning session. |
| Gmail | Disconnected | Not needed for website work. Re-enable if you want claude.ai to help draft or read emails from president@pdtsingers.org during a session. |
| Stripe | Not relevant | PDT does not use Stripe. Leave disconnected. |

**General principle:** MCP connectors are session-scoped. Connecting them gives claude.ai live access to that service during the conversation — useful for specific tasks, not needed for routine coding work. Disconnect after use if you prefer not to grant standing access.

**How to manage connectors:** In claude.ai, open the PDT project → Settings → Connected tools (or similar — exact UI may vary). Connect or disconnect per session as needed.

---

*PDT Singers · pdtsingers.org · Lodge #18, WBQA · Music, Fellowship & Fun*

<!-- html-synced: needs update after maintainers guide HTML sync -->
