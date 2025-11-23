-- Add description_text column to questions_v2 table
ALTER TABLE questions_v2 
ADD COLUMN description_text TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN questions_v2.description_text IS 'Optional descriptive text to display below the question image';

