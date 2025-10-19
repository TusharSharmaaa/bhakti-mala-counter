-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table for user data and preferences
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name TEXT,
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'hi')),
  use_devanagari BOOLEAN DEFAULT false,
  daily_target INTEGER DEFAULT 108 CHECK (daily_target > 0),
  sound_enabled BOOLEAN DEFAULT true,
  sound_option TEXT DEFAULT 'radha' CHECK (sound_option IN ('radha', 'om', 'bell', 'silent')),
  dark_mode BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can only see/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Counters table for jap counts
CREATE TABLE public.counters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  count INTEGER DEFAULT 0 NOT NULL CHECK (count >= 0),
  today_count INTEGER DEFAULT 0 NOT NULL CHECK (today_count >= 0),
  last_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on counters
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;

-- Counters policies: users own their counter data
CREATE POLICY "Users can view own counter"
  ON public.counters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own counter"
  ON public.counters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own counter"
  ON public.counters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own counter"
  ON public.counters FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Streaks table for tracking daily practice
CREATE TABLE public.streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
  last_jap_date DATE,
  last_share_date DATE,
  total_malas INTEGER DEFAULT 0 NOT NULL CHECK (total_malas >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on streaks
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Streaks policies: users own their streak data
CREATE POLICY "Users can view own streak"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own streak"
  ON public.streaks FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Content table for spiritual content (public read-only)
CREATE TABLE public.content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('quote', 'shloka', 'story')),
  content_en TEXT NOT NULL,
  content_hi TEXT,
  translation_en TEXT,
  translation_hi TEXT,
  author TEXT,
  source TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Content policies: everyone can read, only service role can write
CREATE POLICY "Anyone can view content"
  ON public.content FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Initialize counter
  INSERT INTO public.counters (user_id)
  VALUES (NEW.id);
  
  -- Initialize streak
  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile/counter/streak on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at on all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_counters_updated_at
  BEFORE UPDATE ON public.counters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Create indexes for performance
CREATE INDEX idx_counters_user_id ON public.counters(user_id);
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX idx_content_type ON public.content(type);

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.content TO anon;