-- Update the handle_new_user trigger to correctly map first_name and last_name
-- from raw_user_meta_data to the profiles table
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
    NULL,  -- username is no longer used
    NEW.raw_user_meta_data ->> 'first_name',  -- first name goes to profiles.name
    NEW.raw_user_meta_data ->> 'last_name',   -- last name goes to profiles.last_name
    (NEW.raw_user_meta_data ->> 'age')::integer,
    NEW.email
  );
  RETURN NEW;
END;
$$;