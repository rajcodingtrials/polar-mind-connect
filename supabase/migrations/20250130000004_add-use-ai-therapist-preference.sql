-- Add use_ai_therapist preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS use_ai_therapist BOOLEAN NOT NULL DEFAULT true;

