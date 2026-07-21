-- 20260720_harden_handle_new_user.sql
-- Issue #101 — harden the profiles-creation trigger function.
--
-- Security Advisor (2026-07-20) flagged public.handle_new_user() — the SECURITY
-- DEFINER trigger that inserts a profiles row when a new auth.users row is created:
--   * lints 0028/0029: EXECUTE held via PUBLIC, so the function is callable directly
--     via /rest/v1/rpc/handle_new_user by anon and authenticated, bypassing the trigger.
--   * lint 0011: search_path is not pinned (mutable) — exposed to search_path hijacking.
--
-- Revoking EXECUTE does not stop the trigger: trigger execution does not check the
-- EXECUTE privilege against the invoking user, so the profile-on-signup flow is
-- unaffected. Pinning search_path resolves the mutable-search_path warning.
--
-- The function's reference to auth.users is intentional and correct (it fires on an
-- auth.users insert and writes to public.profiles) — do not change it.
--
-- Run manually in the Supabase SQL editor after review.

begin;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
alter function public.handle_new_user() set search_path = public;

commit;
