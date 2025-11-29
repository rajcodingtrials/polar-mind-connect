-- Add image_after_answer column to questions_v2 table
ALTER TABLE questions_v2 
ADD COLUMN IF NOT EXISTS image_after_answer TEXT DEFAULT '' NOT NULL;

-- Update existing rows to have empty strings for the new column
UPDATE questions_v2 
SET image_after_answer = '' 
WHERE image_after_answer IS NULL;

