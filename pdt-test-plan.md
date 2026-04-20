# PDT Singers — Test Plan
# pdtsingers.org
# Last updated: 2026-04-19 (v2 — expanded public pages & Music Library; today's fixes logged)
# Purpose: Pre-launch sign-off · Regression verification · Ongoing QA reference
#
# HOW TO USE
# ----------
# Replace [ ] with [x] as each test passes.
# Log failures with date, browser, and observed vs. expected behavior.
# Retest any previously-failing item after a fix and mark with [x] + "re-tested YYYY-MM-DD".
# Priority column: P1 = block launch · P2 = fix before launch · P3 = fix post-launch
#
# TEST ACCOUNTS NEEDED
# --------------------
# A — admin account (Kevin Bier, role='admin' — confirmed fixed 2026-04-19)
# B — member account (role='member', is_active=true)
# C — inactive account (role='member', is_active=false)
# D — unauthenticated (not logged in)
# E — tech@pdtsingers.org (role='admin', forwards to k7vi@pm.me — confirmed 2026-04-19)
#
# BROWSERS TO COVER
# -----------------
# Desktop: Chrome, Safari, Firefox
# Mobile: iOS Safari, Android Chrome

---

## Section 1 — Authentication & Login

Priority: P1 — all items block launch

| ID    | Priority | Area       | Test Description                                                                 | Account | Expected Result                                                        | Pass? | Notes |
|-------|----------|------------|----------------------------------------------------------------------------------|---------|------------------------------------------------------------------------|-------|-------|
| T-001 | P1       | Auth       | Navigate to /login.html — page loads without console errors                      | D       | Login page renders; magic link form visible                            | [ ]   |       |
| T-002 | P1       | Auth       | Submit magic link with a valid, admin-created email address                      | B       | "Check your email" confirmation shown; no error                        | [ ]   |       |
| T-003 | P1       | Auth       | Submit magic link with an email address NOT in Supabase                          | D       | No magic link sent (shouldCreateUser: false); UI shows neutral message (no account enumeration) | [ ]   |       |
| T-004 | P1       | Auth       | Click magic link from email — lands on /members/ dashboard                       | B       | Redirected to member dashboard; session established                    | [ ]   |       |
| T-005 | P1       | Auth       | Magic link from email — verify noreply@pdtsingers.org is the sender              | B       | From address is noreply@pdtsingers.org (Resend SMTP)                   | [ ]   |       |
| T-006 | P1       | Auth       | Log out from member area — session cleared                                       | B       | Redirected to /login.html or home; /members/ is no longer accessible   | [ ]   |       |
| T-007 | P1       | Auth guard | Navigate directly to /members/ while unauthenticated                             | D       | Redirected to /login.html; member content not visible                  | [ ]   |       |
| T-008 | P1       | Auth guard | Navigate directly to /members/calendar.html while unauthenticated                | D       | Redirected to /login.html                                              | [ ]   |       |
| T-009 | P1       | Auth guard | Navigate directly to /members/music.html while unauthenticated                   | D       | Redirected to /login.html                                              | [ ]   |       |
| T-010 | P1       | Auth guard | Navigate directly to /members/directors-notes.html while unauthenticated         | D       | Redirected to /login.html                                              | [ ]   |       |
| T-011 | P1       | Auth guard | Navigate directly to /members/poohbah.html while unauthenticated                 | D       | Redirected to /login.html                                              | [ ]   |       |
| T-012 | P1       | Auth guard | Navigate directly to /members/comms.html while unauthenticated                   | D       | Redirected to /login.html                                              | [ ]   |       |
| T-013 | P1       | Auth guard | Navigate directly to /members/events.html while unauthenticated                  | D       | Redirected to /login.html                                              | [ ]   |       |
| T-016 | P1       | Auth       | Magic link sent to tech@pdtsingers.org arrives forwarded at k7vi@pm.me and link works | E  | Email received in Proton Mail; magic link logs tech@ into member portal as admin | [ ]   | Workspace-level forwarding confirmed working 2026-04-19 |

---

## Section 2 — Member Portal — Dashboard & Navigation

| ID    | Priority | Area      | Test Description                                                                  | Account | Expected Result                                                        | Pass? | Notes |
|-------|----------|-----------|-----------------------------------------------------------------------------------|---------|------------------------------------------------------------------------|-------|-------|
| T-020 | P1       | Dashboard | /members/ loads without console errors after login                                | B       | Dashboard renders; recent posts from all three blogs visible           | [ ]   |       |
| T-021 | P1       | Dashboard | Member nav links all resolve (no 404s): Home, Director's Notes, Prattlings, Events, Comms, Calendar, Music | B | All 7 nav links load their target pages | [ ]   |       |
| T-022 | P2       | Dashboard | REGRESSION #021 — "Mark myself absent" quick-link visible to regular members      | B       | Button/link visible on dashboard for role='member'; not admin-gated    | [ ]   |       |
| T-023 | P1       | Dashboard | Admin controls visible only to admins (e.g. "New Event", "Edit" buttons)          | B vs A  | role='member' sees no admin controls; role='admin' sees them           | [ ]   |       |
| T-024 | P2       | Nav       | REGRESSION #020 — Home page nav-brand logo is clickable (href="/")               | D       | Clicking PDT logo on index.html navigates to homepage                  | [ ]   |       |
| T-025 | P2       | Nav       | Member portal nav logo links back to /members/ dashboard                          | B       | Clicking logo from within /members/* goes to /members/                 | [ ]   |       |
| T-026 | P2       | Dark mode | All member-area buttons have correct resting state in dark mode (not invisible)   | B       | btn-primary buttons show sky-mid background with forest text in dark mode | [ ]   | Test with OS dark mode enabled |
| T-027 | P2       | Dark mode | Text on .page-hero and .site-footer uses #ffffff not var(--white) — readable in dark mode | D | Footer and hero text white and legible in dark mode                 | [ ]   |       |

---

## Section 3 — Member Blogs

| ID    | Priority | Area  | Test Description                                                                 | Account | Expected Result                                                              | Pass? | Notes |
|-------|----------|-------|----------------------------------------------------------------------------------|---------|------------------------------------------------------------------------------|-------|-------|
| T-030 | P1       | Blog  | Director's Notes page loads; existing posts visible to members                   | B       | Posts render with author "Chris Gabel" (not "Gable")                         | [ ]   |       |
| T-031 | P1       | Blog  | Grand Poohbah's Prattlings page loads; existing posts visible to members         | B       | Posts render with Kevin Bier's attribution                                   | [ ]   |       |
| T-032 | P1       | Blog  | Events blog page loads; existing posts visible to members                        | B       | Posts render; event_date field shown correctly                                | [ ]   |       |
| T-033 | P1       | Blog  | Admin can create a new post on Director's Notes                                  | A       | "New Post" modal opens; form submits; post appears in list                   | [ ]   |       |
| T-034 | P1       | Blog  | Admin can create a new post on Grand Poohbah's Prattlings                        | A       | Post saves and appears                                                       | [ ]   |       |
| T-035 | P1       | Blog  | Admin can create a new post on Events blog                                       | A       | Post saves with event_date; appears in list                                  | [ ]   |       |
| T-036 | P1       | Blog  | Admin can edit an existing post                                                  | A       | Edit modal pre-fills correctly; changes save; updated content shows           | [ ]   |       |
| T-037 | P1       | Blog  | Admin can delete a post — confirm dialog shown before deletion                   | A       | Post removed after confirmation; list refreshes                              | [ ]   |       |
| T-038 | P1       | Blog  | Regular member cannot see New Post / Edit / Delete controls                      | B       | No admin blog controls visible for role='member'                             | [ ]   |       |
| T-039 | P2       | Blog  | New post modal uses modal-hidden class (not hidden attribute)                    | A       | Open DevTools — modal element has modal-hidden class, not hidden attribute   | [ ]   |       |
| T-040 | P2       | Blog  | Dashboard "recent posts" section shows posts from all three blogs                | B       | At least one post from each blog visible in the dashboard feed                | [ ]   |       |

---

## Section 4 — Calendar

Priority: P1 for core functionality; P2 for edge cases

| ID    | Priority | Area          | Test Description                                                                              | Account | Expected Result                                                                                         | Pass? | Notes |
|-------|----------|---------------|-----------------------------------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------|-------|-------|
| T-050 | P1       | Calendar      | /members/calendar.html loads without console errors                                           | B       | Calendar grid renders for current month                                                                | [ ]   |       |
| T-051 | P1       | Calendar      | Monday rehearsals appear on calendar (auto-generated by Edge Function)                        | B       | Blue rehearsal chips visible on upcoming Mondays                                                       | [ ]   |       |
| T-052 | P1       | Calendar      | Navigate to previous month — events load correctly                                            | B       | Prev arrow changes month; past rehearsals visible                                                      | [ ]   |       |
| T-053 | P1       | Calendar      | Navigate to next month — events load correctly                                                | B       | Next arrow changes month; future rehearsals visible                                                    | [ ]   |       |
| T-054 | P1       | Calendar      | "Today" button returns to current month                                                       | B       | Month resets to current; today's date visually highlighted                                             | [ ]   |       |
| T-055 | P1       | Calendar      | Click a rehearsal event — detail panel opens                                                  | B       | Panel shows: event name, date, time (10:30–12:30), location (Westside Journey UMC, 13420 SW Butner Rd) | [ ]   |       |
| T-056 | P1       | Calendar      | Click a non-rehearsal event — detail panel shows correct type and info                        | B       | Correct event type badge (Performance/Board Meeting/Social); all fields shown                          | [ ]   |       |
| T-057 | P1       | Absence       | Member marks themselves absent on a future event                                              | B       | "I won't be there" button available; click → optional note modal → confirms; member appears in absence list | [ ]   |       |
| T-058 | P1       | Absence       | Member undoes their own absence ("I'll be there after all")                                   | B       | Button state changes; member removed from absence list on event detail                                 | [ ]   |       |
| T-059 | P1       | Absence       | Member cannot mark absent on a past event                                                     | B       | Absence CTA not shown for events with event_date < today                                               | [ ]   |       |
| T-060 | P1       | Absence       | Absence list shows all members who are out (transparency for all members)                     | B       | After marking absent as user B, log in as different member and confirm B's name appears in absence list | [ ]   |       |
| T-061 | P1       | Absence       | Absence note appears in event detail (e.g. "Ray Heller — vacation")                           | B       | Note text visible alongside member name in absence list                                                | [ ]   |       |
| T-062 | P1       | Absence       | REGRESSION #022 — "Mark myself absent" accessible to all members, not admin-only             | B       | role='member' can see and use absence CTA on calendar event detail                                    | [ ]   | Cross-check with T-022 |
| T-063 | P2       | Admin — Event | Admin can create a new Performance event                                                      | A       | "New Event" button visible; form accepts Title, Type=Performance, date, time, location, notes; saves   | [ ]   |       |
| T-064 | P2       | Admin — Event | Admin can create a Board Meeting event                                                        | A       | Event saves with correct type; green chip appears on calendar                                          | [ ]   |       |
| T-065 | P2       | Admin — Event | Admin can create a Social Event                                                               | A       | Event saves with warm/coral chip on calendar                                                           | [ ]   |       |
| T-066 | P2       | Admin — Event | Admin can edit an existing event — all fields editable                                        | A       | Edit modal pre-fills; changes persist after save                                                       | [ ]   |       |
| T-067 | P2       | Admin — Event | Admin can mark a rehearsal as Cancelled                                                       | A       | Cancelled checkbox saves; event shows struck-through on calendar                                       | [ ]   |       |
| T-068 | P2       | Admin — Event | Admin can delete an event — confirm dialog shown; associated absences cascade-deleted          | A       | Event removed from calendar; absence records for that event gone from DB                               | [ ]   |       |
| T-069 | P2       | Admin — Event | Non-admin member cannot see Edit / Delete / New Event controls on calendar                   | B       | No admin event controls visible for role='member'                                                      | [ ]   |       |
| T-070 | P2       | Calendar      | Event modal uses modal-hidden class (not hidden attribute)                                    | A       | DevTools: modal element has modal-hidden, no hidden attribute                                          | [ ]   |       |
| T-071 | P3       | Calendar      | Calendar renders correctly on mobile (iOS Safari)                                             | B       | Grid readable; event chips tappable; detail panel usable on small screen                               | [ ]   |       |
| T-072 | P3       | Calendar      | cal-nav-btn and cal-today-btn display white-on-dark in both light and dark mode               | B       | Buttons legible in calendar header band regardless of OS mode                                          | [ ]   |       |

---

## Section 5 — Music Library

| ID    | Priority | Area          | Test Description                                                                              | Account | Expected Result                                                                              | Pass? | Notes |
|-------|----------|---------------|-----------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------|-------|-------|
| T-080 | P1       | Music Library | /members/music.html loads without console errors                                              | B       | Song list renders; no Drive API errors in console                                            | [ ]   |       |
| T-081 | P1       | Music Library | All 11 song folders appear in the library (per Drive folder structure in §5g)                 | B       | Ain't Misbehavin', God Bless America, If There's Anybody Here, Irish Blessing, Just in Time, Just Men Singing Our Song, Let The Rest Of The World Go By, Ride the Chariot, That's An Irish Lullaby, Who Told You, You're As Welcome As The Flowers In May | [ ]   |       |
| T-082 | P1       | Music Library | Song folders expand to show files on click                                                    | B       | Each song row expands to reveal PDF and MP3 file list; collapses on second click             | [ ]   |       |
| T-083 | P1       | Music Library | Member's voice part tracks sorted to top of file list for each song                          | B       | Log in as bass member — bass MP3s listed first in each expanded song                        | [ ]   |       |
| T-084 | P1       | Music Library | Sheet music PDF downloads successfully via Edge Function stream                               | B       | PDF opens/saves; no 403 or 413 error in console or Network tab                              | [ ]   |       |
| T-085 | P1       | Music Library | MP3 learning track downloads successfully (including files >4.5MB)                           | B       | Large MP3 (e.g. bass track) downloads completely; no truncation                             | [ ]   | Regression for 6MB ceiling / streaming Edge Function fix |
| T-086 | P1       | Music Library | "My Tracks + Sheet Music" one-click download works                                           | B       | Downloads voice-part tracks + PDF for selected song; no errors                              | [ ]   |       |
| T-087 | P1       | Music Library | "Download All" for a song works                                                              | B       | All files in song folder downloaded; no files missing                                       | [ ]   |       |
| T-088 | P1       | Music Library | Unauthenticated request to /.netlify/functions/drive-music returns 401                       | D       | 401 response; no file listing returned                                                      | [ ]   |       |
| T-089 | P1       | Music Library | Unauthenticated request to /api/music-download returns 401                                   | D       | 401 response; no file content returned                                                      | [ ]   |       |
| T-090 | P1       | Music Library | Downloaded PDF is not corrupted — opens correctly in a PDF viewer                            | B       | PDF renders all pages of sheet music; no blank or garbled output                            | [ ]   |       |
| T-091 | P1       | Music Library | Downloaded MP3 plays correctly — not truncated or corrupted                                  | B       | Audio plays full duration; no dropout at end                                                | [ ]   |       |
| T-092 | P1       | Music Library | Song list reflects current Drive folder contents — no stale cache                            | B       | Add a test file to Drive; reload music.html; new song appears without code change           | [ ]   | Drive is source of truth — no DB involved |
| T-093 | P2       | Music Library | REGRESSION #022 — voice part pill uses direct window.__PDT_USER check, not event-only       | B       | Voice part label correctly shows on first load without race condition (test on slow network) | [ ]   |       |
| T-094 | P2       | Music Library | Songs with "rehearsal only" designation (Irish Blessing, Just Men Singing, You're As Welcome) displayed correctly | B | Rehearsal-only songs visible and downloadable; no missing songs          | [ ]   |       |
| T-095 | P2       | Music Library | Member with no voice_part set — library still loads without errors                           | B       | No JS error; all files shown without voice-part sorting applied                             | [ ]   | Edge case for new/incomplete profiles |
| T-096 | P2       | Music Library | Network tab confirms all download requests go to /api/music-download — no direct drive.google.com URLs | B | Zero direct Drive URLs in Network tab during any download action              | [ ]   | Key security regression — direct URLs bypass service account |
| T-097 | P2       | Music Library | Netlify Function drive-music returns correct folder listing structure (not empty array)      | B       | Open Network tab; confirm /.netlify/functions/drive-music response contains song folder data | [ ]   |       |
| T-098 | P3       | Music Library | Music Library loads and functions on mobile (iOS Safari)                                     | B       | Song list renders; expand/collapse works; downloads initiate correctly on mobile            | [ ]   |       |
| T-099 | P3       | Music Library | Music Library loads and functions on mobile (Android Chrome)                                 | B       | Same as T-098                                                                               | [ ]   |       |

---

## Section 6 — Public Pages

| ID    | Priority | Area         | Test Description                                                                  | Account | Expected Result                                                                    | Pass? | Notes |
|-------|----------|--------------|-----------------------------------------------------------------------------------|---------|------------------------------------------------------------------------------------|-------|-------|
| T-100 | P1       | Home         | index.html loads without console errors                                           | D       | Page renders; hero, tagline, nav all visible                                       | [ ]   |       |
| T-101 | P1       | Home         | Tagline reads "Music, Fellowship & Fun"                                           | D       | Correct WBQA tagline displayed                                                     | [ ]   |       |
| T-102 | P1       | Home         | Hero section renders correctly — SVG skyline illustration visible                 | D       | Portland skyline + Mt Hood + firs + musical notes; no broken image placeholder    | [ ]   |       |
| T-103 | P2       | Home         | REGRESSION #020 — nav-brand logo on home page is clickable                       | D       | Clicking PDT logo reloads or scrolls to top of index.html; not a dead element     | [ ]   |       |
| T-104 | P1       | Home         | "Join Us" / "Come Sing With Us" CTA button present and links to /join.html        | D       | Button visible in hero or above fold; href resolves correctly                      | [ ]   |       |
| T-105 | P1       | Home         | Upcoming performances section present (or graceful placeholder if none scheduled) | D       | Section renders without errors; no broken layout if empty                          | [ ]   |       |
| T-106 | P1       | Home         | About teaser section present and links to /about.html                             | D       | Teaser text visible; link resolves                                                 | [ ]   |       |
| T-107 | P1       | About        | /about.html loads without console errors                                          | D       | Page renders fully                                                                 | [ ]   |       |
| T-108 | P1       | About        | WBQA Lodge #18 callout present                                                    | D       | "Portland Oregon Lodge #18" and "chartered at the 2026 San Antonio Convention" visible | [ ]   |       |
| T-109 | P1       | About        | BHS non-affiliation statement present                                             | D       | Clear statement that PDT Singers is NOT affiliated with BHS                        | [ ]   |       |
| T-110 | P2       | About        | Chris Gabel's name spelled correctly throughout (not "Gable")                     | D       | "Gabel" — German spelling — everywhere on the page                                 | [ ]   |       |
| T-111 | P1       | About        | Duane Lundsten memorial placeholder present                                       | D       | Placeholder visible; no broken layout                                              | [ ]   |       |
| T-112 | P1       | About        | Leadership bios present for Chris Gabel and Kevin Bier                            | D       | Both co-founders have bio text; no placeholder lorem ipsum                         | [ ]   |       |
| T-113 | P2       | About        | Other leadership listed (Grant Gibson, Sam Vigil, Ray Heller, Moss Egli)         | D       | Leadership table or list renders with correct names and titles                     | [ ]   |       |
| T-114 | P1       | About        | Photo of Chris receiving Lodge #18 charter present (Chris_receiving_Lodge_certificate.jpg) | D | Photo visible in WBQA affiliation section                               | [ ]   |       |
| T-115 | P1       | Performances | /performances.html loads without console errors                                   | D       | Page renders; no broken layout                                                     | [ ]   |       |
| T-116 | P1       | Performances | First sing-out (February 2026, The Social Kitchen, Vancouver WA) listed in past highlights | D | Performance history entry present                                        | [ ]   |       |
| T-117 | P2       | Performances | OPEN ISSUE #018 — booking inquiry Netlify Form present                            | D       | Form with name/email/message fields exists; submits to Netlify Forms               | [ ]   | Currently missing per audit |
| T-118 | P1       | Performances | Page uses term "sing-out" / "sing-outs" — not "concert"                           | D       | No instance of "concert" in page text                                              | [ ]   |       |
| T-119 | P2       | Performances | Performance fee policy stated ($150 standard; free for mission-aligned)           | D       | Fee information present for care facilities looking to book                        | [ ]   |       |
| T-120 | P1       | Join         | /join.html loads without console errors                                           | D       | Page renders fully                                                                 | [ ]   |       |
| T-121 | P1       | Join         | Rehearsal info correct — Mondays 10:30–12:30, 13420 SW Butner Rd, Beaverton OR 97005 | D  | All three details (day, time, address) accurate on page                            | [ ]   |       |
| T-122 | P1       | Join         | Voice placement language present — "not an audition"; sing Happy Birthday          | D       | Low-pressure framing clear; no "audition" language                                 | [ ]   |       |
| T-123 | P1       | Join         | "All men who love to sing are welcome" or equivalent inclusive language present    | D       | Welcoming, non-exclusive tone confirmed                                            | [ ]   |       |
| T-124 | P1       | Join         | Join Us interest form submits via Netlify Forms                                   | D       | Submission accepted; confirmation message shown; no console errors                 | [ ]   |       |
| T-125 | P1       | Join         | Interest form captures: name, email, voice part (optional), message               | D       | All four fields present; voice part not required                                   | [ ]   |       |
| T-126 | P1       | Join         | WBQA Lodge #18 credibility callout present                                        | D       | PDT Singers / worldwide community mention visible                                  | [ ]   |       |
| T-127 | P2       | Music page   | /music.html loads without console errors                                          | D       | Page renders; barbershop tradition section visible                                 | [ ]   |       |
| T-128 | P2       | Music page   | Current repertoire (8 songs) referenced or listed                                 | D       | Song list or repertoire mention present; no placeholder lorem ipsum                | [ ]   |       |
| T-129 | P2       | Friends      | /friends.html loads without errors                                                | D       | Page renders                                                                       | [ ]   |       |
| T-130 | P2       | Friends      | OPEN ISSUE #019 — Facebook button not a dead href="#"                             | D       | Either live Facebook link or button clearly labelled "coming soon"                 | [ ]   | Blocked on Moss Egli setup |
| T-131 | P1       | Contact      | /contact.html loads without console errors                                        | D       | Page renders; contact form visible                                                 | [ ]   |       |
| T-132 | P1       | Contact      | General contact form submits via Netlify Forms                                    | D       | Submission accepted; confirmation message shown                                    | [ ]   |       |
| T-133 | P1       | Contact      | Contact form captures name, email, and message at minimum                         | D       | Required fields present; form validates before submit                              | [ ]   |       |
| T-134 | P1       | All public   | WBQA logo appears in footer on every public page                                  | D       | WBQA badge visible in site-footer on all 7 public pages                            | [ ]   |       |
| T-135 | P1       | All public   | PDT logo appears in nav on every public page; not oversized                       | D       | Logo renders correctly on all 7 pages                                              | [ ]   |       |
| T-136 | P1       | All pages    | Footer text is #ffffff not var(--white) — readable in dark mode                   | D       | Footer text legible with OS dark mode enabled                                      | [ ]   |       |
| T-137 | P1       | All public   | No page uses the word "concert" — correct term is "sing-out"                      | D       | Search all public page text; "concert" does not appear                             | [ ]   |       |
| T-138 | P1       | All public   | First-person plural voice throughout — "we sing", "come sing with us"             | D       | Spot-check home, about, join pages for consistent "we" voice                       | [ ]   |       |
| T-139 | P2       | 404          | Navigate to a non-existent URL (e.g. /does-not-exist)                             | D       | Friendly 404 page in site style; not a Netlify default error page                  | [ ]   |       |

---

## Section 7 — Security & Access Control

| ID    | Priority | Area     | Test Description                                                                              | Account | Expected Result                                                                      | Pass? | Notes |
|-------|----------|----------|-----------------------------------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------|-------|-------|
| T-170 | P1       | Security | Supabase RLS — unauthenticated read of `posts` table returns empty/blocked                   | D       | Direct Supabase API call (anon key) returns no rows from posts                       | [ ]   |       |
| T-171 | P1       | Security | Supabase RLS — unauthenticated read of `events` table returns empty/blocked                  | D       | Direct API call returns no rows from events                                          | [ ]   |       |
| T-172 | P1       | Security | Supabase RLS — unauthenticated read of `absences` table returns empty/blocked                | D       | Direct API call returns no rows from absences                                        | [ ]   |       |
| T-173 | P1       | Security | Supabase RLS — unauthenticated read of `profiles` table returns empty/blocked                | D       | Direct API call returns no rows from profiles                                        | [ ]   |       |
| T-174 | P1       | Security | No secrets present in any committed HTML, JS, or CSS file in GitHub repo                     | —       | Search repo for known secret patterns — none found; all values reference window.__PDT_ENV | [ ]   |       |
| T-175 | P1       | Security | tech@pdtsingers.org account confirmed — role='admin', is_active=true, email correct          | A       | Supabase profile e94f7959 shows full_name='Tech Support', role='admin', is_active=true | [x]   | Resolved — migrated from Music Fairy via SQL 2026-04-19 |
| T-176 | P2       | Security | Member cannot mark absence for another member (RLS absences_insert_own policy)               | B       | Attempt to POST absence with a different member_id — rejected by Supabase RLS        | [ ]   |       |
| T-177 | P2       | Security | Member cannot delete another member's absence                                                 | B       | Attempt to DELETE another member's absence row — rejected by RLS                    | [ ]   |       |

---

## Section 8 — Performance & Cross-Browser

| ID    | Priority | Area        | Test Description                                                         | Account | Expected Result                                                           | Pass? | Notes |
|-------|----------|-------------|--------------------------------------------------------------------------|---------|---------------------------------------------------------------------------|-------|-------|
| T-140 | P2       | Performance | index.html Lighthouse score — Performance ≥ 80                           | D       | Lighthouse (Chrome DevTools) reports ≥ 80 performance                    | [ ]   |       |
| T-141 | P2       | Performance | /members/calendar.html Lighthouse score — Performance ≥ 70               | B       | ≥ 70 (heavier page due to Supabase calls)                                 | [ ]   |       |
| T-142 | P3       | Browser     | Full member portal flow — Chrome desktop                                 | B       | Login → dashboard → calendar → music → blog → logout all work            | [ ]   |       |
| T-143 | P3       | Browser     | Full member portal flow — Safari desktop                                 | B       | Same as T-142                                                             | [ ]   |       |
| T-144 | P3       | Browser     | Full member portal flow — Firefox desktop                                | B       | Same as T-142                                                             | [ ]   |       |
| T-145 | P3       | Browser     | Full member portal flow — iOS Safari mobile                              | B       | Same as T-142; touch targets adequate                                     | [ ]   |       |
| T-146 | P3       | Browser     | Public pages — Chrome, Safari, Firefox desktop                           | D       | All 7 public pages render correctly in all three browsers                 | [ ]   |       |
| T-147 | P3       | Mobile      | Public pages responsive — iOS Safari                                     | D       | No horizontal scroll; nav usable; CTAs tappable                          | [ ]   |       |
| T-148 | P3       | Mobile      | Public pages responsive — Android Chrome                                 | D       | Same as T-147                                                             | [ ]   |       |

---

## Section 9 — Pre-Launch Checklist

These are one-time verifications before DNS cutover from GreenGeeks to Netlify.

| ID    | Priority | Area       | Test Description                                                                     | Expected Result                                                              | Done? | Notes |
|-------|----------|------------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------|-------|-------|
| T-150 | P1       | DNS        | SSL certificate valid at pdtsingers.org after DNS cutover                            | HTTPS with valid cert; no browser security warning                           | [ ]   |       |
| T-151 | P1       | DNS        | Netlify custom domain configured and serving correct site                            | pdtsingers.org and www.pdtsingers.org both resolve to Netlify site           | [ ]   |       |
| T-152 | P1       | Deploy     | Netlify auto-publish confirmed locked after DNS cutover                              | Auto-publish is OFF in Netlify dashboard                                     | [ ]   |       |
| T-153 | P2       | SEO        | meta description tags present on all public pages                                    | View source — each public page has a unique <meta name="description"> tag   | [ ]   |       |
| T-154 | P2       | SEO        | OpenGraph tags present on home page at minimum                                       | og:title, og:description, og:image present in <head>                        | [ ]   |       |
| T-155 | P2       | SEO        | XML sitemap present at /sitemap.xml                                                  | File accessible; includes all 7 public page URLs                            | [ ]   |       |
| T-156 | P2       | SEO        | Google Search Console property verified for pdtsingers.org                           | GSC shows property active; no crawl errors                                  | [ ]   |       |
| T-157 | P1       | Forms      | Netlify Forms active — test submission received in Netlify dashboard after cutover   | Submission visible under Forms in Netlify UI                                | [ ]   |       |
| T-158 | P1       | Email      | Magic link email delivers from noreply@pdtsingers.org after cutover                  | Email received; from address correct; link works                             | [ ]   |       |
| T-159 | P1       | Admin      | Kevin Bier can log in and access all admin features in production                    | Admin controls visible; can create post, create event, manage members       | [ ]   | #026 confirmed fixed 2026-04-19 |
| T-160 | P1       | Email      | Magic link to tech@pdtsingers.org forwards to k7vi@pm.me and link works             | Email received in Proton Mail; magic link logs tech@ into member portal as admin | [ ]   | Workspace-level forwarding confirmed 2026-04-19 |

---

## Known Open Issues Cross-Reference

| Audit # | Severity | Status   | Linked Tests       | Description                                                          |
|---------|----------|----------|--------------------|----------------------------------------------------------------------|
| #018    | Medium   | Open     | T-117              | performances.html missing booking inquiry form                        |
| #019    | Low      | Open     | T-130              | friends.html Facebook button is dead href="#"                        |
| #020    | Low      | Open     | T-024, T-103       | index.html nav-brand not an anchor tag                               |
| #021    | Medium   | Open     | T-022, T-062       | "Mark myself absent" admin-gated — should be all members            |
| #022    | Low      | Open     | T-093              | music.html voice pill uses event-only, no direct window check        |
| #024    | Done     | Resolved | —                  | seed-members.mjs PII — gitignored                                    |
| #025    | Low      | Open     | —                  | members/resources.html doesn't exist (Phase 2 tracker)              |
| #026    | High     | Resolved | T-015, T-159       | Kevin Bier profile role='admin' — fixed via SQL 2026-04-19           |
| #027    | Medium   | Resolved | T-175              | Music Fairy account migrated to tech@pdtsingers.org 2026-04-19      |

---

*Portland DayTime Singers — pdtsingers.org*
*Test plan maintained by Kevin Bier. Update after each test session.*
