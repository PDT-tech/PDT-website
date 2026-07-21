-- 20260720_tighten_table_grants.sql
-- Issue #087 — Supabase Data API grant hardening (defense-in-depth).
--
-- Audit (2026-07-20) found all six member-data tables carry FULL privileges for
-- anon, authenticated, and service_role — the standard Supabase default posture,
-- not a per-table mistake. No public/logged-out page reads these tables via the
-- Data API (public pages use the Netlify Function proxy or static content), and
-- every RLS policy on them gates on auth.uid() / auth.role() = 'authenticated',
-- so anon is already blocked at the row level (confirmed via pg_policies,
-- 2026-07-20). Revoking anon's table grants is therefore behavior-neutral today;
-- it removes the latent risk that a future RLS misconfiguration could silently
-- expose member data (including PII in profiles) to an unauthenticated caller
-- holding the public anon key.
--
-- End state per table: anon = no privileges; authenticated & service_role hold
-- SELECT/INSERT/UPDATE/DELETE (RLS remains the per-row gate for authenticated;
-- service_role bypasses RLS and is server-side only). The authenticated grant is
-- effectively a no-op re-assertion (it already holds these) kept for explicitness.
--
-- Run manually in the Supabase SQL editor after review.
-- Pre-run check (expect zero rows): confirm no grants to the PUBLIC pseudo-role,
-- which anon would inherit:
--   select table_name, privilege_type from information_schema.role_table_grants
--   where table_schema='public' and grantee='PUBLIC'
--     and table_name in ('profiles','events','absences','event_attendance','photo_uploads','posts');
-- If any rows appear, add `revoke all on public.<table> from public;` for each.

begin;

-- profiles
revoke all on public.profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- events
revoke all on public.events from anon;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.events to service_role;

-- absences
revoke all on public.absences from anon;
grant select, insert, update, delete on public.absences to authenticated;
grant select, insert, update, delete on public.absences to service_role;

-- event_attendance
revoke all on public.event_attendance from anon;
grant select, insert, update, delete on public.event_attendance to authenticated;
grant select, insert, update, delete on public.event_attendance to service_role;

-- photo_uploads
revoke all on public.photo_uploads from anon;
grant select, insert, update, delete on public.photo_uploads to authenticated;
grant select, insert, update, delete on public.photo_uploads to service_role;

-- posts
revoke all on public.posts from anon;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.posts to service_role;

commit;
