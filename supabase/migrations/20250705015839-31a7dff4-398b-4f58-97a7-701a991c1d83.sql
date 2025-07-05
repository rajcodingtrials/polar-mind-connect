
-- Update the tts_settings table structure to support multiple therapist configurations
-- First, ensure we have therapist-specific settings for both Laura and Lawrence

-- Insert default settings for Lawrence if not exists
INSERT INTO public.tts_settings (therapist_name, voice, speed, enable_ssml, sample_ssml)
SELECT 'Lawrence', 'echo', 1.0, false, '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tts_settings WHERE therapist_name = 'Lawrence'
);

-- Ensure Laura has her settings (in case the previous migration didn't create a record)
INSERT INTO public.tts_settings (therapist_name, voice, speed, enable_ssml, sample_ssml)
SELECT 'Laura', 'nova', 1.0, false, '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tts_settings WHERE therapist_name = 'Laura'
);
