# PDT Singers — Issue Tracker
# Maintained exclusively by CC (Claude Code). Do not edit manually.
# Last updated: 2026-04-19

001 | OPEN   | Portal exit link: no path from member portal back to public site. Add "/" link to portal footer wordmark "Portland DayTime Singers". See also 010.
002 | OPEN   | Logo: replace raster placeholders with vector art (blocked on Mercedes Gibson delivery). Validate light/dark mode rendering.
003 | DONE   | "Men who love to sing" headline: force three-line break on desktop. Fixed 2026-04-17.
004 | DONE   | Calendar page: restore h1 colored horizontal border. Fixed 2026-04-17.
005 | DONE   | Calendar "Today" button: dark-mode contrast fix. Fixed 2026-04-17.
006 | DONE   | Mobile: WBQA logo too small and right-justified in hero. Fixed 2026-04-17.
007 | DONE   | Mobile: no path to member portal. Hamburger menu added to all pages. Fixed 2026-04-17.
008 | DONE   | Footer: add home page link on all pages. Fixed 2026-04-17.
009 | DONE   | Calendar: "Today" and "+ New Event" buttons on same horizontal line. Fixed 2026-04-17.
010 | DONE   | Portal footer: wrap "Portland DayTime Singers" wordmark in href="/". Fixed 2026-04-17.
011 | DONE   | Mobile header: quick links — resolved via hamburger menu (option B). Fixed 2026-04-17.
012 | DONE   | Auto-populate Monday rehearsals through end of calendar year via populate-rehearsals.js. Fixed 2026-04-17.
013 | DONE   | Header link: underline "Portland DayTime Singers" as full phrase. Fixed 2026-04-17.
014 | OPEN   | Main page: animated photo carousel between hero and CTA. See pdt-photo-feature.md. Reconcile with 015 before implementing.
015 | OPEN   | Photo upload, gallery, and animated carousel full feature. See pdt-photo-feature.md for architecture and open questions.
016 | DONE   | Music Library: 403 error observed in production on 2026-04-17 when downloading from members/music.html. Root cause: dlUrl() built direct drive.google.com URLs, bypassing the proxy. Initial fix (base64 proxy via serverless function) hit Netlify 6MB response limit immediately (6.5MB MP3 → 413). Final fix: Netlify Edge Function (netlify/edge-functions/drive-music-download.js) streams driveRes.body directly — no buffering, no size ceiling, token stays server-side. drive-music.js now handles listing only. Fixed 2026-04-18. Files: netlify/edge-functions/drive-music-download.js, netlify/functions/drive-music.js, members/music.html, netlify.toml.
017 | DONE   | Attendance: convert to page-level save with batched notifications. HIGH — do before any member uses attendance. Button clicks = local selections only (no Supabase write on click); single Save button batch-writes all changed rows; on success show "Saved ✓". Notification change: remove per-row Supabase webhook; Save handler calls notify-attendance-change Edge Function directly with full batch payload; one email to member + one to director per save. Update Edge Function to accept array payload. UI layout, styling, deep-link behavior, RLS, table structure, pg_cron unaffected. Fixed 2026-04-18. Files: members/attendance.html (save bar UI), members/js/attendance.js (batch upsert + Edge Function call), supabase/functions/notify-attendance-change/index.ts (array payload, member + director emails). ⚠️ Kevin: delete the attendance-change database webhook in Supabase dashboard (no longer needed). Deploy Edge Function: supabase functions deploy notify-attendance-change. Set secret: supabase secrets set RESEND_API_KEY=<key>.
018 | OPEN   | performances.html: missing Netlify booking inquiry form. §5e requires a booking/performance inquiry form on the Performances page. Currently the page only has an email link. Add a Netlify Form (name="booking-inquiry") with fields: name, email, organization/venue, preferred date, message.
019 | OPEN   | friends.html: Facebook CTA button links to href="#" — dead link visible to all public visitors. Blocked on Moss Egli setting up the PDT Singers Facebook page. Update href when page is live.
020 | OPEN   | index.html: nav-brand is a <div> not an <a href="/"> — the home page logo/wordmark is not a clickable link. All other pages correctly use <a href="/" class="nav-brand">. Fix: change <div class="nav-brand"> to <a href="/" class="nav-brand">.
021 | OPEN   | members/index.html line 79: "Mark myself absent" button has class pdt-admin-only — only admins see it on the dashboard. All active members should be able to mark themselves absent from the next-rehearsal card. Remove pdt-admin-only class.
022 | OPEN   | members/music.html line 342: voice pill only adds a pdt:profile-loaded event listener; never checks window.__PDT_USER directly first. Convention violation (pdt-conventions.md §Role Visibility Pattern) — voice pill silently absent if profile loaded before listener is attached. Fix: check window.__PDT_USER first, fall back to event.
023 | OPEN   | members/events.html line 260: post save payload includes event_date field but the posts table has no event_date column — field is silently dropped on every insert/update. Either add event_date to the posts table schema or remove the field from the payload.
024 | DONE   | seed-members.mjs: untracked file contains 15 member names and email addresses (PII). Added to .gitignore 2026-04-19 to prevent accidental commit.
025 | OPEN   | members/resources.html: listed in requirements §4.2 as a member-only page but the file does not exist and the member nav has no Resources link. Phase 2 item — log for tracking.
