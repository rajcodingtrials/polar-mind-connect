
-- Create table for storing questions
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  image_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create storage bucket for question images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for questions table
CREATE POLICY "Allow all operations for authenticated users" ON public.questions
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for storage bucket
CREATE POLICY "Allow public read access to question images" ON storage.objects
  FOR SELECT USING (bucket_id = 'question-images');

CREATE POLICY "Allow authenticated users to upload question images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'question-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update question images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'question-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete question images" ON storage.objects
  FOR DELETE USING (bucket_id = 'question-images' AND auth.role() = 'authenticated');
