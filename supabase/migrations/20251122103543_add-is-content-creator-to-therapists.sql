-- Add is_content_creator column to therapists table with default value false
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS is_content_creator BOOLEAN NOT NULL DEFAULT false;

