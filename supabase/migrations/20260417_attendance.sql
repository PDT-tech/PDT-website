-- PDT Singers — Attendance feature migration
-- Run in Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── New columns on events ─────────────────────────────────────
alter table events add column if not exists call_time     time;
alter table events add column if not exists dress_code    text;
alter table events add column if not exists parking_notes text;
alter table events add column if not exists address       text;

-- Pre-populate address for existing rehearsals
update events
set address = '13420 SW Butner Rd, Beaverton OR 97005'
where event_type = 'rehearsal' and address is null;

-- ── event_attendance table ────────────────────────────────────
create table if not exists event_attendance (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  member_id   uuid not null references profiles(id) on delete cascade,
  status      text not null
                check (status in ('attending', 'not_sure', 'not_attending')),
  reason      text,
  updated_at  timestamptz not null default now(),
  unique (event_id, member_id)
);

alter table event_attendance enable row level security;

create policy "attendance_select_authenticated"
  on event_attendance for select
  using (auth.role() = 'authenticated');

create policy "attendance_insert_own"
  on event_attendance for insert
  with check (auth.uid() = member_id);

create policy "attendance_update_own"
  on event_attendance for update
  using (auth.uid() = member_id);

create policy "attendance_update_admin"
  on event_attendance for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── pg_cron setup ─────────────────────────────────────────────
-- Run this AFTER deploying the send-attendance-emails Edge Function.
-- Replace YOUR_PROJECT_REF and YOUR_ANON_KEY with real values
-- (find them in Supabase Dashboard → Project Settings → API).
--
-- select cron.schedule(
--   'send-attendance-emails-daily',
--   '0 15 * * *',  -- 7:00 AM PST / 8:00 AM PDT (accepts ~1hr seasonal drift)
--   $$
--   select net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-attendance-emails',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer YOUR_ANON_KEY',
--       'Content-Type', 'application/json'
--     )
--   ) as request_id;
--   $$
-- );

-- ── Database webhook setup ────────────────────────────────────
-- Configure in Supabase Dashboard → Database → Webhooks → Create new webhook:
--   Name:    notify-attendance-change
--   Table:   public.event_attendance
--   Events:  INSERT, UPDATE
--   URL:     https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-attendance-change
--   Method:  POST
--   Headers: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--            Content-Type: application/json

-- ── Edge Function secrets needed ─────────────────────────────
-- Add in Supabase Dashboard → Edge Functions → Manage secrets:
--   RESEND_API_KEY  — your Resend API key
--   SITE_URL        — https://pdtsingers.org
