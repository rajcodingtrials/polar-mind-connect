-- Fix the handle_therapist_updated_at function
CREATE OR REPLACE FUNCTION public.handle_therapist_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;