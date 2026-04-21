
---

## 5j. "Can You Be There?" Attendance Page — `/members/attendance.html`

**Last updated:** 2026-04-21  
**Status:** UI redesign approved; backing logic and schema already built

### Overview

The attendance page lets members declare their availability for upcoming rehearsals
and sing-outs. It is a member-facing self-service tool; the director and admin see
member responses via the existing notification emails and (future) the sing-out
attendance report (FWI-C, pdt-issues.md #033).

### Layout

Two side-by-side clusters on a single page:

| Left cluster | Right cluster |
|---|---|
| Sing-outs & Events | Rehearsals |
| Visual priority — sing-outs are special | Routine — lower visual weight |
| Three-way status radio | Two-way status radio |

Each cluster is enclosed in a light-stroke rounded rectangle. On mobile, clusters
stack vertically (sing-outs above rehearsals).

### Dropdown behavior

Each cluster has a dropdown listing all events of that type with
`event_date >= today`, ordered soonest first. The soonest event is selected
by default when the page loads. Selecting a different event from the dropdown
immediately reloads the status and reason controls with the member's previously
saved state for that event (or defaults to `attending` / empty reason if no
prior record exists).

### Status options

**Sing-outs & Events cluster:**
- "I'll be there" (`attending`)
- "I'm not sure" (`not_sure`)
- "I can't be there" (`not_attending`)

**Rehearsals cluster:**
- "I'll be there" (`attending`)
- "I won't be there" (`not_attending`)
- `not_sure` is not offered for rehearsals

### Reason field

- Appears and is active when status is `not_attending` or `not_sure`
- Hidden or disabled when status is `attending`
- Always optional — never required
- Pre-populated with previously saved reason when an event is selected and
  a prior record exists

### Save behavior

- Save button writes the current status + reason for the selected event to
  Supabase (`event_attendance` table, upsert on `event_id` + `member_id`)
- On successful save: inline "Saved ✓" confirmation
- After save: `notify-attendance-change` Edge Function called with the change;
  member receives confirmation email; director receives summary for
  non-rehearsal events only

### Dirty-state warning

If the member changes status or reason without saving and attempts to navigate
away or select a different event from the dropdown, a browser `confirm()` dialog
warns: "You have unsaved changes — leave anyway?" If the member confirms, changes
are discarded. If they cancel, they remain on the current event.

### Database

All state lives in the `event_attendance` table (not `absences`):

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `event_id` | uuid FK → events | cascade delete |
| `member_id` | uuid FK → profiles | cascade delete |
| `status` | text NOT NULL | check: `attending` \| `not_sure` \| `not_attending` |
| `reason` | text | nullable |
| `updated_at` | timestamptz | default now() |

Unique constraint on `(event_id, member_id)`. No schema changes are needed for
the UI redesign.

### Notification emails (as-built)

Handled by `notify-attendance-change` Supabase Edge Function, called by the
client after each batch save:
- Member always receives a confirmation email listing their saved choice
- Director (Chris Gabel) receives a summary for non-rehearsal events only;
  rehearsal changes are not reported to the director

### Future work (not in scope for UI redesign)

- **Escalation pipeline** (pdt-issues.md #031): pg_cron job + `send-attendance-emails`
  Edge Function for 10-day "not_sure" reminder and 7-day auto-mark to `not_attending`
  with member + director notifications. Migration placeholder exists in
  `20260417_attendance.sql` but is commented out pending Edge Function deployment.
- **Admin attendance override** (pdt-issues.md #032): admin sets state on behalf
  of a member (e.g. Kevin transcribing clipboard absences). Lives in admin panel.
- **Sing-out attendance report** (pdt-issues.md #033): report showing all three
  voting states plus no-response members for any sing-out. Accessible to admin
  and musical_director roles.
