-- PDT Singers — pg_cron job for HEIC → JPEG conversion
-- Calls the convert-heic Supabase Edge Function every 15 minutes.
--
-- BEFORE RUNNING: Verify pg_cron is available on your Supabase plan.
-- It is enabled by default on Pro; on Free tier, use the Supabase
-- Dashboard → Database → Extensions and enable pg_cron manually,
-- or trigger convert-heic manually / via a Netlify scheduled function.
--
-- Also verify the app.* settings are configured:
--   ALTER DATABASE postgres SET app.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';
--   ALTER DATABASE postgres SET app.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY';
-- (Run these in the SQL editor before scheduling the cron job.)

SELECT cron.schedule(
  'convert-heic-photos',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/convert-heic',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body    := '{}'::jsonb
    );
  $$
);
