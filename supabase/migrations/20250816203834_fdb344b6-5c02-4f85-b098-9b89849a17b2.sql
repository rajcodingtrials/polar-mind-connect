-- Add new personal information fields to therapists table
ALTER TABLE public.therapists 
ADD COLUMN first_name text,
ADD COLUMN last_name text,
ADD COLUMN date_of_birth date,
ADD COLUMN phone text,
ADD COLUMN country text,
ADD COLUMN email text,
ADD COLUMN education text,
ADD COLUMN languages text[];

-- Update existing name column to be nullable since we're now using first_name/last_name
ALTER TABLE public.therapists ALTER COLUMN name DROP NOT NULL;