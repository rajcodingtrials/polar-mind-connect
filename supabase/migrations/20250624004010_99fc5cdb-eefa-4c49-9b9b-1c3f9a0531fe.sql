
-- Add question_type column to questions table
ALTER TABLE public.questions 
ADD COLUMN question_type TEXT;

-- Create an enum type for question types (optional but recommended for data integrity)
CREATE TYPE question_type_enum AS ENUM (
  'first_words',
  'question_time', 
  'build_sentence',
  'lets_chat'
);

-- Update the column to use the enum type
ALTER TABLE public.questions 
ALTER COLUMN question_type TYPE question_type_enum 
USING question_type::question_type_enum;

-- Set a default value for existing records
UPDATE public.questions 
SET question_type = 'question_time' 
WHERE question_type IS NULL;

-- Make the column not null now that we have default values
ALTER TABLE public.questions 
ALTER COLUMN question_type SET NOT NULL;

-- Set default for new records
ALTER TABLE public.questions 
ALTER COLUMN question_type SET DEFAULT 'question_time';
