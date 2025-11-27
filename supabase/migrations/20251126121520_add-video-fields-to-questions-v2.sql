-- Add question_video_before and question_video_after columns to questions_v2 table
ALTER TABLE questions_v2 
ADD COLUMN IF NOT EXISTS question_video_before TEXT DEFAULT '' NOT NULL,
ADD COLUMN IF NOT EXISTS question_video_after TEXT DEFAULT '' NOT NULL;

-- Update existing rows to have empty strings for the new columns
UPDATE questions_v2 
SET question_video_before = '' 
WHERE question_video_before IS NULL;

UPDATE questions_v2 
SET question_video_after = '' 
WHERE question_video_after IS NULL;

