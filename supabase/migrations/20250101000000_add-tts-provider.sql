-- Add provider column to tts_settings table
ALTER TABLE tts_settings 
ADD COLUMN provider VARCHAR(20) DEFAULT 'openai';

-- Update Lawrence to use Google TTS
UPDATE tts_settings 
SET provider = 'google', voice = 'echo'
WHERE therapist_name = 'Lawrence';

-- Keep Laura on OpenAI for now (gradual migration)
UPDATE tts_settings 
SET provider = 'openai', voice = 'nova'
WHERE therapist_name = 'Laura'; 