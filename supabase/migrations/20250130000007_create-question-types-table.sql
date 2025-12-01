-- Create question_types table
CREATE TABLE IF NOT EXISTS public.question_types (
  name TEXT PRIMARY KEY,
  display_string TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_question_types_name ON public.question_types(name);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_question_types_updated_at
  BEFORE UPDATE ON public.question_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on question_types table
ALTER TABLE public.question_types ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read question types
CREATE POLICY "Allow authenticated users to read question_types" ON public.question_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage question types
CREATE POLICY "Allow admins to manage question_types" ON public.question_types
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Populate question_types table with existing enum values
INSERT INTO public.question_types (name, display_string, description) VALUES
  ('starter_words', 'Starter Words', 'Learn your first words like open, more and go'),
  ('first_words', 'First Words', 'Practice basic first words and sounds'),
  ('question_time', 'Question Time', 'Answer questions about pictures'),
  ('build_sentence', 'Build a Sentence', 'Learn to construct sentences'),
  ('lets_chat', 'Let''s Chat', 'Free conversation practice'),
  ('tap_and_play', 'Tap and Play', 'Choose the correct picture by tapping'),
  ('story_activity', 'Story Activity', 'Follow along with interactive story scenes')
ON CONFLICT (name) DO NOTHING;

-- Convert question_type columns from enum to TEXT
-- First, convert questions table
ALTER TABLE public.questions 
  ALTER COLUMN question_type TYPE TEXT 
  USING question_type::TEXT;

-- Convert questions_v2 table
ALTER TABLE public.questions_v2 
  ALTER COLUMN question_type TYPE TEXT 
  USING question_type::TEXT;

-- Convert lessons_v2 table
ALTER TABLE public.lessons_v2 
  ALTER COLUMN question_type TYPE TEXT 
  USING question_type::TEXT;

-- Add foreign key constraints (optional, for referential integrity)
-- Note: We'll add these after ensuring all data is valid
-- ALTER TABLE public.questions 
--   ADD CONSTRAINT fk_questions_question_type 
--   FOREIGN KEY (question_type) REFERENCES public.question_types(name);

-- ALTER TABLE public.questions_v2 
--   ADD CONSTRAINT fk_questions_v2_question_type 
--   FOREIGN KEY (question_type) REFERENCES public.question_types(name);

-- ALTER TABLE public.lessons_v2 
--   ADD CONSTRAINT fk_lessons_v2_question_type 
--   FOREIGN KEY (question_type) REFERENCES public.question_types(name);

-- Note: The enum type question_type_enum is not dropped to avoid breaking existing code
-- It can be dropped in a future migration after all code is updated

