-- Move Laura from OpenAI TTS to Google TTS
-- Update Laura to use Google TTS with a proper female voice

-- Update Laura to use Google TTS
UPDATE public.tts_settings 
SET 
  provider = 'google',
  voice = 'en-US-Neural2-J', -- Proper Google TTS female voice
  speed = 1.0,
  updated_at = now()
WHERE therapist_name = 'Laura';

-- If Laura doesn't exist, create the record
INSERT INTO public.tts_settings (therapist_name, provider, voice, speed, enable_ssml, sample_ssml)
SELECT 
  'Laura',
  'google',
  'en-US-Neural2-J',
  1.0,
  false,
  '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tts_settings WHERE therapist_name = 'Laura'
); 