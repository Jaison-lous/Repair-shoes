-- Force PostgREST to reload the schema by sending a NOTIFY signal
-- This is equivalent to reloading the schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative: You can also just wait a few minutes, or restart your Supabase project
-- from the dashboard (Project Settings -> General -> Pause/Resume project)
