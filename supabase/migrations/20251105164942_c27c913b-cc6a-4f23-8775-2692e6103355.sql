-- Check and create storage policies for therapist-photos bucket

-- First, ensure the bucket exists and is public (for viewing photos)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'therapist-photos') THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('therapist-photos', 'therapist-photos', true);
  ELSE
    UPDATE storage.buckets 
    SET public = true 
    WHERE id = 'therapist-photos';
  END IF;
END $$;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Therapists can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Therapists can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view therapist photos" ON storage.objects;

-- Policy: Allow therapists to upload their own photos
CREATE POLICY "Therapists can upload their own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'therapist-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow therapists to update their own photos
CREATE POLICY "Therapists can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'therapist-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'therapist-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow therapists to delete their own photos
CREATE POLICY "Therapists can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'therapist-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view therapist photos (since bucket is public)
CREATE POLICY "Anyone can view therapist photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'therapist-photos');