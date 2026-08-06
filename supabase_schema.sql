-- ==========================================================
-- SUPABASE SCHEMA FOR SLOW LIFE MUSIC CURATION APP
-- Run this script in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  category TEXT DEFAULT 'Hindi',
  spotify_url TEXT,
  youtube_url TEXT,
  audio_url TEXT,
  description TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  duration TEXT DEFAULT '04:12',
  duration_sec INTEGER DEFAULT 252,
  added_date TEXT
);

-- 2. Create stats table
CREATE TABLE IF NOT EXISTS public.stats (
  id INT PRIMARY KEY DEFAULT 1,
  curator_note TEXT,
  instagram_handle TEXT
);

-- 3. Insert default stats row if not exists
INSERT INTO public.stats (id, curator_note, instagram_handle)
VALUES (1, 'Music is the soundtrack of our lives. Here are some of my favorite tracks that bring peace, nostalgia, and joy.', 'pranaydubey06')
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies allowing full read/write access for API client
CREATE POLICY "Allow public read access to songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Allow public write access to songs" ON public.songs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to stats" ON public.stats FOR SELECT USING (true);
CREATE POLICY "Allow public write access to stats" ON public.stats FOR ALL USING (true) WITH CHECK (true);
