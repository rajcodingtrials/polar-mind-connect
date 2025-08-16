-- Revert profiles table to previous structure
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS country;

-- Add back the original columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Update the trigger function to use the original fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, age, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'name',
    (NEW.raw_user_meta_data ->> 'age')::integer,
    NEW.email
  );
  RETURN NEW;
END;
$$;