-- Add speech_after_answer column to questions_v2 table
ALTER TABLE questions_v2 
ADD COLUMN IF NOT EXISTS speech_after_answer TEXT DEFAULT '' NOT NULL;

-- Update existing rows to have empty string for the new column
UPDATE questions_v2 
SET speech_after_answer = '' 
WHERE speech_after_answer IS NULL;

