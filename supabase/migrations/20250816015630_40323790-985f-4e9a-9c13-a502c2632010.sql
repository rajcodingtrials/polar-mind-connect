-- Fix RLS policies for therapist photo uploads
-- Remove existing policies if they exist
DROP POLICY IF EXISTS "Therapist photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can delete their own photos" ON storage.objects;

-- Create correct RLS policies for therapist-photos bucket
CREATE POLICY "Therapist photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'therapist-photos');

CREATE POLICY "Therapists can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'therapist-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Therapists can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'therapist-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Therapists can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'therapist-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

-- Fix RLS policies for therapist-documents bucket  
DROP POLICY IF EXISTS "Therapists can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can delete their own documents" ON storage.objects;

CREATE POLICY "Therapists can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'therapist-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Therapists can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'therapist-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Therapists can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'therapist-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Therapists can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'therapist-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);