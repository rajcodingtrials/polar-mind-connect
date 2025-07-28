-- Add speech_delay_mode column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN speech_delay_mode BOOLEAN NOT NULL DEFAULT false;