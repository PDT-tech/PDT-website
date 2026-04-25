-- Allow admin to insert event_attendance rows on behalf of any member
create policy "attendance_insert_admin"
  on event_attendance for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
