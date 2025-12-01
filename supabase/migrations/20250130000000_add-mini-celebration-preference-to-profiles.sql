-- Add add_mini_celebration preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN add_mini_celebration BOOLEAN NOT NULL DEFAULT false;

