-- Add question_speech column to questions_v2 table
ALTER TABLE questions_v2 
ADD COLUMN question_speech TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN questions_v2.question_speech IS 'Text content to be read aloud via text-to-speech. If null, question_text will be used as fallback.';

