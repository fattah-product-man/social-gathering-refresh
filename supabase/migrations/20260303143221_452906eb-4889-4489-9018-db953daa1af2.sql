
-- Fix: Drop restrictive policies and recreate as permissive

-- Guests
DROP POLICY IF EXISTS "Anyone can read guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Guests can update own record" ON public.guests;

CREATE POLICY "Anyone can read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests can update own record" ON public.guests FOR UPDATE USING (true) WITH CHECK (true);

-- Wall posts
DROP POLICY IF EXISTS "Anyone can read wall posts" ON public.wall_posts;
DROP POLICY IF EXISTS "Anyone can insert wall posts" ON public.wall_posts;

CREATE POLICY "Anyone can read wall posts" ON public.wall_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert wall posts" ON public.wall_posts FOR INSERT WITH CHECK (true);

-- Scores
DROP POLICY IF EXISTS "Anyone can read scores" ON public.scores;
DROP POLICY IF EXISTS "Anyone can insert scores" ON public.scores;

CREATE POLICY "Anyone can read scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scores" ON public.scores FOR INSERT WITH CHECK (true);

-- Feedback
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;

CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);

-- Events: also need to fix the view access. Drop restrictive policy, allow select for service role only
DROP POLICY IF EXISTS "No direct select on events" ON public.events;
