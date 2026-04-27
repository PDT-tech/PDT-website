-- Drop the blanket unique constraint that incorrectly prevents two non-rehearsal
-- events of the same type on the same day. It was designed for rehearsal dedup
-- only (generate-rehearsals upsert), not as a business rule for all event types.
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_event_date_key;

-- Replace with a partial unique index scoped to rehearsals only.
CREATE UNIQUE INDEX events_rehearsal_date_key
  ON events(event_date)
  WHERE event_type = 'rehearsal';
