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
    -- Insert parent record with default lessons
    INSERT INTO public.parents (user_id, lessons)
    VALUES (
      NEW.id,
      '1ad57f79-ea9f-4894-8765-34083fb57f4f,284fef51-e2d0-407d-8930-de6184391899,31eb7a4d-8ffc-40b0-8677-b10a0dceee5e,386985d6-3112-49bc-bca6-00939178d13e,40f0b51c-f17b-44ad-b65d-378ae8c71e33,4875e9ac-0d28-4376-9278-9fb93f0f6044,52157e52-cb71-4ef5-8d9f-4873712c8058,6efb2910-6cc7-43fe-9198-410b28f6b2be,80f72e1b-f7b8-4b60-8719-cbf9dfa8da09,a9ce2a9c-f34b-4d65-a32b-e8172925e406,b7ff0731-c0a3-43a4-9d15-efc911a9ce60,c251fd3d-bc3f-4954-8c2b-8293d3aad96d,d6d77133-e396-4797-a728-cbff7ccaf0c8,d91592cc-c1ac-4cb2-8a9d-c0cd91b7d6da'
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

