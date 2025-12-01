-- Quick fix: Convert boolean columns to TEXT
-- Run this SQL directly in Supabase SQL Editor to fix the issue immediately

-- Convert speech_delay_mode from boolean to TEXT
ALTER TABLE public.profiles 
ALTER COLUMN speech_delay_mode TYPE TEXT USING 
  CASE 
    WHEN speech_delay_mode = true THEN 'yes'
    WHEN speech_delay_mode = false THEN 'no'
    ELSE 'default'
  END;

ALTER TABLE public.profiles 
ALTER COLUMN speech_delay_mode SET DEFAULT 'default';

ALTER TABLE public.profiles 
ALTER COLUMN speech_delay_mode SET NOT NULL;

-- Convert add_mini_celebration from boolean to TEXT
ALTER TABLE public.profiles 
ALTER COLUMN add_mini_celebration TYPE TEXT USING 
  CASE 
    WHEN add_mini_celebration = true THEN 'yes'
    WHEN add_mini_celebration = false THEN 'no'
    ELSE 'default'
  END;

ALTER TABLE public.profiles 
ALTER COLUMN add_mini_celebration SET DEFAULT 'default';

ALTER TABLE public.profiles 
ALTER COLUMN add_mini_celebration SET NOT NULL;

