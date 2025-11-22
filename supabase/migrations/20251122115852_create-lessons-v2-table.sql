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
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

