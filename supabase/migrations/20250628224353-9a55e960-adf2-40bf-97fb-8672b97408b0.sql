
-- Create a storage bucket for cartoon characters
INSERT INTO storage.buckets (id, name, public)
VALUES ('cartoon-characters', 'cartoon-characters', true);

-- Create RLS policies for the cartoon-characters bucket
CREATE POLICY "Anyone can view cartoon characters" ON storage.objects
FOR SELECT USING (bucket_id = 'cartoon-characters');

CREATE POLICY "Authenticated users can upload cartoon characters" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'cartoon-characters' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cartoon characters" ON storage.objects
FOR UPDATE USING (bucket_id = 'cartoon-characters' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cartoon characters" ON storage.objects
FOR DELETE USING (bucket_id = 'cartoon-characters' AND auth.role() = 'authenticated');

-- Create a table to store cartoon character metadata
CREATE TABLE public.cartoon_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert cartoon character data
INSERT INTO public.cartoon_characters (name, storage_path, animal_type) VALUES
('Happy Giraffe', 'giraffe.png', 'giraffe'),
('Cute Elephant', 'elephant.png', 'elephant'),
('Friendly Bear', 'bear.png', 'bear'),
('Playful Tiger', 'tiger.png', 'tiger'),
('Sweet Fox', 'fox.png', 'fox');

-- Add RLS policies for cartoon_characters table
ALTER TABLE public.cartoon_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cartoon characters metadata" 
  ON public.cartoon_characters 
  FOR SELECT 
  USING (true);
