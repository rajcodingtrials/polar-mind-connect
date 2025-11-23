-- Add lesson column to questions_v2 table
ALTER TABLE questions_v2 
ADD COLUMN lesson TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN questions_v2.lesson IS 'Lesson text content associated with this question';

