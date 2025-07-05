
-- Clear all existing TTS settings
DELETE FROM public.tts_settings;

-- Insert the original default TTS settings
INSERT INTO public.tts_settings (voice, speed, enable_ssml, sample_ssml, therapist_name) 
VALUES (
  'nova', 
  1.0, 
  false, 
  '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>',
  'Laura'
);
