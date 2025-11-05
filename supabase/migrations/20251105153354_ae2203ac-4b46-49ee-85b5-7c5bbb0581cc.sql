-- Add 'therapist' to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'therapist';

-- Function to handle therapist role assignment on signup
CREATE OR REPLACE FUNCTION public.handle_therapist_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user metadata indicates therapist signup
  IF NEW.raw_user_meta_data->>'is_therapist' = 'true' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'therapist'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to assign therapist role on user creation
DROP TRIGGER IF EXISTS on_therapist_signup ON auth.users;
CREATE TRIGGER on_therapist_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_therapist_signup();