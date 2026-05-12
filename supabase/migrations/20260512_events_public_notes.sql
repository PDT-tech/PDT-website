-- Add public_notes column to events table
-- This is the public-facing editorial/narrative field for the Events page and public site.
-- Separate from `notes` which is operational/internal only.
ALTER TABLE events ADD COLUMN public_notes text;
