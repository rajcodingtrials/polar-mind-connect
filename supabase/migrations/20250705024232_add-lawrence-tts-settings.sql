-- Add Lawrence's TTS settings with 'echo' male voice
INSERT INTO public.tts_settings (voice, speed, enable_ssml, sample_ssml, therapist_name) 
VALUES (
  'echo', 
  1.0, 
  false, 
  '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let''s have fun learning together!</emphasis></speak>',
  'Lawrence'
);
