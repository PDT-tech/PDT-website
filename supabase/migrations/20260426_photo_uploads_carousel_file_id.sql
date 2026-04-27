-- PDT Singers — Add carousel_file_id to photo_uploads
-- Stores the Drive file ID of the copy in Mainpage_Carousel.
-- Required by curate-photo Edge Function to delete the carousel copy
-- when a photo is made non-public.

ALTER TABLE photo_uploads ADD COLUMN IF NOT EXISTS carousel_file_id text;
