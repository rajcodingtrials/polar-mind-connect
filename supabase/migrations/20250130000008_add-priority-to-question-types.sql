-- Add priority column to question_types table
ALTER TABLE public.question_types 
ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;

-- Create index for better performance when sorting by priority
CREATE INDEX IF NOT EXISTS idx_question_types_priority ON public.question_types(priority DESC);

-- Set initial priority values for existing question types (higher number = higher priority, shown first)
-- You can adjust these values as needed
UPDATE public.question_types SET priority = 10 WHERE name = 'starter_words';
UPDATE public.question_types SET priority = 9 WHERE name = 'first_words';
UPDATE public.question_types SET priority = 8 WHERE name = 'question_time';
UPDATE public.question_types SET priority = 7 WHERE name = 'build_sentence';
UPDATE public.question_types SET priority = 6 WHERE name = 'lets_chat';
UPDATE public.question_types SET priority = 5 WHERE name = 'tap_and_play';
UPDATE public.question_types SET priority = 4 WHERE name = 'story_activity';

