-- PDT Singers — Photo uploads schema migration
-- Run in Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── photo_uploads table ──────────────────────────────────────

create table if not exists photo_uploads (
  id                uuid        primary key default gen_random_uuid(),
  drive_file_id     text        not null,
  drive_filename    text        not null,
  uploader_id       uuid        not null references profiles(id),
  event_id          uuid        references events(id),      -- nullable: null = no event tagged
  uploaded_at       timestamptz not null default now(),
  is_public         boolean     not null default false,
  conversion_status text        not null default 'done'
                                check (conversion_status in ('pending','processing','done','failed')),
  conversion_error  text                                    -- nullable: populated on conversion failure
);

-- HEIC uploads land with conversion_status = 'pending'.
-- All other uploads (JPEG) land with conversion_status = 'done'.
-- The convert-heic Supabase Edge Function polls for 'pending' rows every 15 minutes.

alter table photo_uploads enable row level security;

-- ── RLS policies ─────────────────────────────────────────────

-- All authenticated members can see all rows (member gallery)
create policy "photo_uploads_select_member"
  on photo_uploads for select
  to authenticated
  using (true);

-- Any authenticated member can insert their own uploads
create policy "photo_uploads_insert_member"
  on photo_uploads for insert
  to authenticated
  with check (uploader_id = auth.uid());

-- Only admin and events_editor can update rows (curation toggles, conversion status)
create policy "photo_uploads_update_curator"
  on photo_uploads for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'events_editor')
    )
  );

-- Only admin can delete rows
create policy "photo_uploads_delete_admin"
  on photo_uploads for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );
