-- Add last_name column to profiles table
ALTER TABLE public.profiles
ADD COLUMN last_name text;

-- Make username nullable since we're removing it from signup
ALTER TABLE public.profiles
ALTER COLUMN username DROP NOT NULL;

-- Update the handle_new_user function to handle first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, last_name, age, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'last_name',
    (NEW.raw_user_meta_data ->> 'age')::integer,
    NEW.email
  );
  RETURN NEW;
END;
$$;