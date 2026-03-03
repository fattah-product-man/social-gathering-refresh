
-- 1. Add SELECT policy on events table so the events_public view works
CREATE POLICY "Anyone can read events"
  ON public.events FOR SELECT
  USING (true);

-- 2. Grant SELECT on the events_public view to anon and authenticated
GRANT SELECT ON public.events_public TO anon, authenticated;
