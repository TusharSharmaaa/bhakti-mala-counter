-- Add daily progress tracking table
-- This migration adds support for tracking daily progress history for calendar view

CREATE TABLE public.daily_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  jap_count INTEGER DEFAULT 0 NOT NULL CHECK (jap_count >= 0),
  malas_completed INTEGER DEFAULT 0 NOT NULL CHECK (malas_completed >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable RLS on daily_progress
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- Daily progress policies: users can only see/update their own progress
CREATE POLICY "Users can view own daily progress"
  ON public.daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress"
  ON public.daily_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress"
  ON public.daily_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily progress"
  ON public.daily_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for efficient querying by user and date
CREATE INDEX idx_daily_progress_user_date ON public.daily_progress(user_id, date DESC);

-- Add comments
COMMENT ON TABLE public.daily_progress IS 'Tracks daily progress history for calendar view';
COMMENT ON COLUMN public.daily_progress.date IS 'The date for this progress record';
COMMENT ON COLUMN public.daily_progress.jap_count IS 'Number of japs completed on this date';
COMMENT ON COLUMN public.daily_progress.malas_completed IS 'Number of complete malas (108 japs) completed on this date';
