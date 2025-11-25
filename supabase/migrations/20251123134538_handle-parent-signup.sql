-- Function to handle parent record creation on signup
-- If user is not a therapist, create a parent record with default lessons
CREATE OR REPLACE FUNCTION public.handle_parent_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is NOT a therapist (not in therapists table and not marked as therapist in metadata)
  IF NOT EXISTS (
    SELECT 1 FROM public.therapists WHERE user_id = NEW.id
  ) AND (NEW.raw_user_meta_data->>'is_therapist' IS NULL OR NEW.raw_user_meta_data->>'is_therapist' != 'true') THEN
    -- Insert parent record with empty lessons (default lessons are handled via get_default_lessons() function)
    INSERT INTO public.parents (user_id, lessons)
    VALUES (
      NEW.id,
      '' -- Empty string - default lessons are accessed via get_default_lessons() function
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to create parent record on user creation
DROP TRIGGER IF EXISTS on_parent_signup ON auth.users;
CREATE TRIGGER on_parent_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_parent_signup();

