-- Add pitch column to tts_settings table
ALTER TABLE tts_settings 
ADD COLUMN pitch DECIMAL(4,1) DEFAULT 0.0 CHECK (pitch >= -20.0 AND pitch <= 20.0); 