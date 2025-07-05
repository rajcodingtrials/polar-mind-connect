
-- Add the therapist_name column back to tts_settings table
ALTER TABLE public.tts_settings 
ADD COLUMN IF NOT EXISTS therapist_name TEXT NOT NULL DEFAULT 'Laura';

-- Update any existing records to have the default therapist name
UPDATE public.tts_settings 
SET therapist_name = 'Laura' 
WHERE therapist_name IS NULL OR therapist_name = '';
