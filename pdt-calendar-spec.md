# PDT Singers — Member Calendar Feature Spec

**Last updated:** 2026-03-28  
**Status:** Approved — ready to build  
**Part of:** Phase 3 — Member Portal

---

## 1. Overview

The Member Calendar is the centerpiece of the PDT Singers member portal. It serves two
primary purposes:

1. **Event visibility** — members see upcoming rehearsals, performances, board meetings,
   and social events in one place
2. **Attendance tracking** — members mark themselves absent (with a note) so the director
   knows who to expect at any given rehearsal or performance

---

## 2. User Roles & Permissions

| Role | Supabase Value | Who | Permissions |
|------|---------------|-----|-------------|
| `admin` | `admin` | Kevin Bier | Full access: create/edit/delete events, view all absences, manage members, post to any blog |
| `musical_director` | `musical_director` | Chris Gabel | Post to Director's Notes blog; read all member content |
| `events_editor` | `events_editor` | Social media manager, Wives Auxiliary, etc. | Post to Events blog only |
| `calendar_manager` | `calendar_manager` | Future social media hire (non-member) | Create/edit/delete events only; cannot see member data |
| `member` | `member` | All active PDT Singers members | Mark own absence; view all member content; read-only on blogs |

---

## 3. Event Types

| Type | Color Code | Recurrence | Notes |
|------|-----------|------------|-------|
| Rehearsal | Blue | Every Monday, auto-generated | Admin can cancel/modify individual dates |
| Performance | Gold | Manual | Includes venue, time, dress code notes |
| Board Meeting | Green | Manual | |
| Social Event | Warm/Coral | Manual | |

---

## 4. Feature Details

### 4.1 Calendar View (all logged-in users)
- Monthly calendar grid showing all events
- Click any event to see event detail panel:
  - Event name, type, date, time, location
  - Notes/description
  - **Absence list**: names of members who have marked themselves out
  - **"I won't be there" button** (if member hasn't already marked absent)
  - **"I'll be there after all" button** (to undo an absence)

### 4.2 Marking Absence (members, admins)
- Member clicks event → clicks "I won't be there"
- Modal/inline form appears with:
  - Optional note field: "Reason (optional) — e.g. vacation, doctor, work"
  - Confirm button
- Member can undo absence at any time before the event date
- After event date passes, absence is locked (historical record)

### 4.3 Absence Summary (members see, admins see)
- On event detail: simple list of member names who are marked absent
  - Format: "Out: Ray Heller (vacation), Sam Vigil (travel)"
- Members CAN see who else is out — transparency helps with planning
- No count target / quorum tracking needed at launch

### 4.4 Admin Event Management
- **Create event** button (admins and calendar_managers)
- Event form fields:
  - Title (text)
  - Type (dropdown: Rehearsal / Performance / Board Meeting / Social Event)
  - Date (date picker)
  - Start time, End time
  - Location (text)
  - Notes/description (textarea)
  - Cancelled (checkbox) — for cancelling a recurring rehearsal
- **Edit** and **Delete** buttons on any event (admins/calendar_managers only)
- Deleting an event also deletes associated absences (cascade)

### 4.5 Auto-Generated Rehearsals
- On Supabase: a scheduled Edge Function runs weekly (or on-demand) to generate
  Monday rehearsal events for the next 12 weeks rolling
- Default values:
  - Title: "Monday Rehearsal"
  - Time: 10:30am – 12:30pm
  - Location: Westside Journey United Methodist Church, 13420 SW Butner Rd, Beaverton OR 97005
- Admin can edit any individual instance (e.g. change location for a holiday)
- Admin can mark any instance as "Cancelled" — shows on calendar as struck-through

---

## 5. Supabase Database Schema

### 5.1 Table: `profiles`
Extends Supabase auth.users with PDT-specific fields.

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null default 'member'
                check (role in ('admin', 'calendar_manager', 'member')),
  voice_part  text check (voice_part in ('tenor', 'lead', 'baritone', 'bass')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS: members can read all profiles (for absence display)
-- RLS: members can only update their own profile
-- RLS: admins can update any profile
alter table profiles enable row level security;

create policy "profiles_select_member"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);

create policy "profiles_update_admin"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 5.2 Table: `events`

```sql
create table events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  event_type    text not null
                  check (event_type in ('rehearsal', 'performance', 'board_meeting', 'social')),
  event_date    date not null,
  start_time    time,
  end_time      time,
  location      text,
  notes         text,
  is_cancelled  boolean not null default false,
  is_recurring  boolean not null default false,  -- true for auto-generated rehearsals
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- RLS: all authenticated users can read events
-- RLS: only admins and calendar_managers can insert/update/delete
alter table events enable row level security;

create policy "events_select_authenticated"
  on events for select
  using (auth.role() = 'authenticated');

create policy "events_insert_admin_or_manager"
  on events for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'calendar_manager')
    )
  );

create policy "events_update_admin_or_manager"
  on events for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'calendar_manager')
    )
  );

create policy "events_delete_admin_or_manager"
  on events for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'calendar_manager')
    )
  );
```

### 5.3 Table: `absences`

```sql
create table absences (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  member_id   uuid not null references profiles(id) on delete cascade,
  note        text,                         -- optional: "vacation", "doctor", etc.
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (event_id, member_id)              -- one absence record per member per event
);

-- RLS: all authenticated members can read absences (transparency)
-- RLS: members can only insert/delete their own absence
-- RLS: admins can insert/delete any absence
alter table absences enable row level security;

create policy "absences_select_authenticated"
  on absences for select
  using (auth.role() = 'authenticated');

create policy "absences_insert_own"
  on absences for insert
  with check (auth.uid() = member_id);

create policy "absences_delete_own"
  on absences for delete
  using (auth.uid() = member_id);

create policy "absences_delete_admin"
  on absences for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 5.4 Auto-Generation: Rehearsal Edge Function

```javascript
// supabase/functions/generate-rehearsals/index.ts
// Generates Monday rehearsal events for the next 12 weeks
// Run on deploy and weekly via Supabase cron

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

Deno.serve(async () => {
  const today = new Date()
  const rehearsals = []

  for (let week = 0; week < 12; week++) {
    const date = new Date(today)
    // Find next Monday
    const daysUntilMonday = (1 - date.getDay() + 7) % 7 || 7
    date.setDate(date.getDate() + daysUntilMonday + (week * 7))

    const dateStr = date.toISOString().split('T')[0]

    rehearsals.push({
      title: 'Monday Rehearsal',
      event_type: 'rehearsal',
      event_date: dateStr,
      start_time: '10:30:00',
      end_time: '12:30:00',
      location: 'Westside Journey United Methodist Church, 13420 SW Butner Rd, Beaverton OR 97005',
      is_recurring: true
    })
  }

  // Upsert — skip dates that already exist
  const { error } = await supabase
    .from('events')
    .upsert(rehearsals, {
      onConflict: 'event_type,event_date',
      ignoreDuplicates: true
    })

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  return new Response(JSON.stringify({ generated: rehearsals.length }), { status: 200 })
})
```

---

## 6. Frontend Pages & Components

### 6.1 `/members/calendar.html`
Main calendar page. Requires `member` role or higher.

**Sections:**
- Month navigation (prev/next arrows, month/year display)
- Calendar grid (7 columns, Mon–Sun)
- Event chips on each day (color-coded by type)
- Click event → slide-in detail panel (right side or modal on mobile)

**Detail panel contains:**
- Event title, type badge, date, time, location
- Notes (if any)
- Cancelled banner (if cancelled)
- Absence section: "Who's out: [names with notes]"
- CTA: "I won't be there" / "I'll be there after all" / "You're marked absent" (state-aware)
- Admin only: Edit / Delete buttons

### 6.2 Components needed (vanilla JS)
- `calendar.js` — renders the monthly grid, handles navigation
- `events.js` — fetches events from Supabase for displayed month
- `absences.js` — fetch, mark, and unmark absences
- `event-form.js` — admin create/edit event modal
- `auth-guard.js` — redirects unauthenticated users to /login

---

## 7. Open Questions

- [ ] Should cancelled rehearsals show on calendar (struck-through) or be hidden?
- [ ] Email notification when admin adds a new performance? (nice-to-have)
- [ ] Should the calendar be visible to `calendar_manager` role without being a member?
- [ ] Historical data: how far back should past events remain visible?

---

## 8. Build Order

1. Set up Supabase project + run schema SQL
2. Generate rehearsal events (run Edge Function once manually to seed data)
3. Build auth: login page, Supabase JS client, auth-guard
4. Build calendar grid (static first, no data)
5. Wire calendar to Supabase events
6. Build absence mark/unmark
7. Build event detail panel
8. Build admin event create/edit form
9. Test end-to-end: login → view calendar → mark absence → admin sees it
