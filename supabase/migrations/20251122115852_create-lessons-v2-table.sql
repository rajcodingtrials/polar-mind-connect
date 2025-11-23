-- Create lessons_v2 table
CREATE TABLE lessons_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  question_type question_type_enum NOT NULL,
  level TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  youtube_video_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_lessons_v2_question_type ON lessons_v2(question_type);
CREATE INDEX idx_lessons_v2_level ON lessons_v2(level);
CREATE INDEX idx_lessons_v2_is_verified ON lessons_v2(is_verified);

-- Create trigger to automatically update updated_at timestamp
-- Note: update_updated_at_column() function should already exist from previous migrations
-- If it doesn't exist, it will be created here
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lessons_v2_updated_at
  BEFORE UPDATE ON lessons_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on lessons_v2 table
ALTER TABLE lessons_v2 ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read verified lessons
CREATE POLICY "Allow authenticated users to read verified lessons_v2" ON lessons_v2
  FOR SELECT USING (auth.role() = 'authenticated' AND is_verified = true);

-- Allow content creators (therapists with is_content_creator = true) to insert their own lessons
CREATE POLICY "Allow content creators to insert lessons_v2" ON lessons_v2
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM therapists 
      WHERE therapists.user_id = auth.uid() 
      AND therapists.is_content_creator = true
    )
  );

-- Allow content creators to update their own lessons
CREATE POLICY "Allow content creators to update lessons_v2" ON lessons_v2
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM therapists 
      WHERE therapists.user_id = auth.uid() 
      AND therapists.is_content_creator = true
    )
  );

-- Allow admins to manage all lessons_v2
CREATE POLICY "Allow admins to manage lessons_v2" ON lessons_v2
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Create questions_v2 table
CREATE TABLE questions_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  answer TEXT,
  answer_index INTEGER,
  question_image TEXT,
  choices_text TEXT,
  choices_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  question_type question_type_enum NOT NULL,
  lesson_id UUID REFERENCES lessons_v2(id) ON DELETE CASCADE,
  question_index INTEGER
);

-- Create indexes for better performance
CREATE INDEX idx_questions_v2_lesson_id ON questions_v2(lesson_id);
CREATE INDEX idx_questions_v2_question_type ON questions_v2(question_type);
CREATE INDEX idx_questions_v2_created_by ON questions_v2(created_by);
CREATE INDEX idx_questions_v2_lesson_question_index ON questions_v2(lesson_id, question_index);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_questions_v2_updated_at
  BEFORE UPDATE ON questions_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on questions_v2 table
ALTER TABLE questions_v2 ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read questions from verified lessons
CREATE POLICY "Allow authenticated users to read questions_v2 from verified lessons" ON questions_v2
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM lessons_v2 
      WHERE lessons_v2.id = questions_v2.lesson_id 
      AND lessons_v2.is_verified = true
    )
  );

-- Allow content creators to insert their own questions
CREATE POLICY "Allow content creators to insert questions_v2" ON questions_v2
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM therapists 
      WHERE therapists.user_id = auth.uid() 
      AND therapists.is_content_creator = true
    ) AND
    EXISTS (
      SELECT 1 FROM lessons_v2 
      WHERE lessons_v2.id = questions_v2.lesson_id
    )
  );

-- Allow content creators to update their own questions
CREATE POLICY "Allow content creators to update questions_v2" ON questions_v2
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM therapists 
      WHERE therapists.user_id = auth.uid() 
      AND therapists.is_content_creator = true
    )
  );

-- Allow content creators to delete their own questions
CREATE POLICY "Allow content creators to delete questions_v2" ON questions_v2
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM therapists 
      WHERE therapists.user_id = auth.uid() 
      AND therapists.is_content_creator = true
    )
  );

-- Allow admins to manage all questions_v2
CREATE POLICY "Allow admins to manage questions_v2" ON questions_v2
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Create storage bucket for question images v2
INSERT INTO storage.buckets (id, name, public) 
VALUES ('question-images-v2', 'question-images-v2', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for question-images-v2 bucket
CREATE POLICY "Allow public read access to question-images-v2" ON storage.objects
  FOR SELECT USING (bucket_id = 'question-images-v2');

CREATE POLICY "Allow authenticated users to upload question-images-v2" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'question-images-v2' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update question-images-v2" ON storage.objects
  FOR UPDATE USING (bucket_id = 'question-images-v2' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete question-images-v2" ON storage.objects
  FOR DELETE USING (bucket_id = 'question-images-v2' AND auth.role() = 'authenticated');

