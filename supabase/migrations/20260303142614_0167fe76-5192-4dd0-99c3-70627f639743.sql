
-- ============================================
-- TABLES
-- ============================================

CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_name TEXT NOT NULL,
  reveal_matches BOOLEAN NOT NULL DEFAULT false,
  admin_passcode TEXT NOT NULL DEFAULT '1234',
  start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_token TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  instagram TEXT,
  energy_level TEXT,
  goals TEXT[],
  interests TEXT[],
  answers JSONB DEFAULT '{}',
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, guest_token)
);

CREATE TABLE public.wall_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_token TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  gif_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_token TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_token TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- VIEW: events_public (hides admin_passcode)
-- ============================================

CREATE VIEW public.events_public AS
  SELECT id, name, host_name, reveal_matches, start_time, created_at
  FROM public.events;

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Events: only select via view, no direct access needed
CREATE POLICY "No direct select on events" ON public.events FOR SELECT TO anon USING (false);

-- Guests
CREATE POLICY "Anyone can read guests" ON public.guests FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert guests" ON public.guests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Guests can update own record" ON public.guests FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Wall posts
CREATE POLICY "Anyone can read wall posts" ON public.wall_posts FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert wall posts" ON public.wall_posts FOR INSERT TO anon WITH CHECK (true);

-- Scores
CREATE POLICY "Anyone can read scores" ON public.scores FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert scores" ON public.scores FOR INSERT TO anon WITH CHECK (true);

-- Feedback
CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- STORAGE: avatars bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload avatars" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update avatars" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'avatars');

-- ============================================
-- SEED: Demo event
-- ============================================

INSERT INTO public.events (id, name, host_name, admin_passcode, start_time)
VALUES ('8f42b1c3-5d9e-4a7b-b2e1-9c3f4d5a6e7b', 'Ramadan Iftar 2026', 'Hashem', '1234', now() + interval '2 hours');
