-- Add last_share_date column to streaks table
-- This migration adds support for tracking WhatsApp sharing to maintain streaks

ALTER TABLE public.streaks 
ADD COLUMN last_share_date DATE;

-- Update the comment to reflect the new functionality
COMMENT ON TABLE public.streaks IS 'Tracks daily practice streaks based on jap counting OR WhatsApp sharing';
COMMENT ON COLUMN public.streaks.last_share_date IS 'Last date when user shared content on WhatsApp (maintains streak)';
COMMENT ON COLUMN public.streaks.last_jap_date IS 'Last date when user did jap counting (maintains streak)';
COMMENT ON COLUMN public.streaks.current_streak IS 'Current consecutive days streak (maintained by jap OR sharing)';
COMMENT ON COLUMN public.streaks.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN public.streaks.total_malas IS 'Total malas completed (calculated from jap count)';

