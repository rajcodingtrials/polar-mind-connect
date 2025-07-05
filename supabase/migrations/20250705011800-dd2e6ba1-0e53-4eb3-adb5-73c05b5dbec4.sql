
-- Add therapist_name column to tts_settings table
ALTER TABLE public.tts_settings 
ADD COLUMN therapist_name TEXT NOT NULL DEFAULT 'Laura';

-- Update existing settings to be Laura-specific
UPDATE public.tts_settings 
SET therapist_name = 'Laura';

-- Insert default Lawrence settings with a male voice
INSERT INTO public.tts_settings (
  therapist_name,
  voice,
  speed,
  enable_ssml,
  sample_ssml
) VALUES (
  'Lawrence',
  'echo',
  1.0,
  false,
  '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>'
);

-- Create unique constraint to prevent duplicate therapist settings
ALTER TABLE public.tts_settings 
ADD CONSTRAINT unique_therapist_settings UNIQUE (therapist_name);
