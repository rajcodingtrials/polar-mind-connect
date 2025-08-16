-- Create storage buckets for therapist files
INSERT INTO storage.buckets (id, name, public) VALUES ('therapist-photos', 'therapist-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('therapist-documents', 'therapist-documents', false);

-- Create storage policies for therapist photos (public access)
CREATE POLICY "Therapist photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'therapist-photos');

CREATE POLICY "Therapists can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'therapist-photos' AND 
  EXISTS (
    SELECT 1 FROM therapists 
    WHERE therapists.user_id = auth.uid() 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Therapists can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'therapist-photos' AND 
  EXISTS (
    SELECT 1 FROM therapists 
    WHERE therapists.user_id = auth.uid() 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Therapists can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'therapist-photos' AND 
  EXISTS (
    SELECT 1 FROM therapists 
    WHERE therapists.user_id = auth.uid() 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- Create storage policies for therapist documents (private access)
CREATE POLICY "Therapists can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'therapist-documents' AND 
  EXISTS (
    SELECT 1 FROM therapists 
    WHERE therapists.user_id = auth.uid() 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Therapists can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'therapist-documents' AND 
  EXISTS (
    SELECT 1 FROM therapists 
    WHERE therapists.user_id = auth.uid() 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Therapists can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'therapist-documents' AND 
  EXISTS (
    SELECT 1 FROM therapists 
    WHERE therapists.user_id = auth.uid() 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Therapists can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'therapist-documents' AND 
  EXISTS (
    SELECT 1 FROM therapists 
    WHERE therapists.user_id = auth.uid() 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- Admins can manage all therapist files
CREATE POLICY "Admins can manage all therapist photos" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'therapist-photos' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage all therapist documents" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'therapist-documents' AND 
  has_role(auth.uid(), 'admin'::app_role)
);