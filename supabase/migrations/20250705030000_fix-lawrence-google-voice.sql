-- Fix Lawrence's TTS settings to use proper Google TTS voice
-- The 'echo' voice is an OpenAI voice, not a Google TTS voice

-- Update Lawrence to use a proper Google TTS male voice
UPDATE public.tts_settings 
SET 
  provider = 'google',
  voice = 'en-US-Neural2-I', -- Proper Google TTS male voice
  speed = 1.0,
  updated_at = now()
WHERE therapist_name = 'Lawrence';

-- If Lawrence doesn't exist, create the record
INSERT INTO public.tts_settings (therapist_name, provider, voice, speed, enable_ssml, sample_ssml)
SELECT 
  'Lawrence',
  'google',
  'en-US-Neural2-I',
  1.0,
  false,
  '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tts_settings WHERE therapist_name = 'Lawrence'
); 