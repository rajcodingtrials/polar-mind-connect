-- Create lessons table
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  question_type question_type_enum NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add lesson_id column to questions table
ALTER TABLE questions ADD COLUMN lesson_id UUID REFERENCES lessons(id);

-- Create indexes for better performance
CREATE INDEX idx_lessons_question_type ON lessons(question_type);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty_level);
CREATE INDEX idx_questions_lesson_id ON questions(lesson_id);

-- Enable RLS on lessons table
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active lessons
CREATE POLICY "Allow authenticated users to read active lessons" ON lessons
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow admins to manage lessons
CREATE POLICY "Allow admins to manage lessons" ON lessons
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Update questions RLS policy to include lesson filtering
DROP POLICY IF EXISTS "Allow authenticated users to read questions" ON questions;
CREATE POLICY "Allow authenticated users to read questions by lesson" ON questions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    (lesson_id IS NULL OR EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = questions.lesson_id 
      AND lessons.is_active = true
    ))
  );

-- Allow admins to manage questions
CREATE POLICY "Allow admins to manage questions" ON questions
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
  )); 