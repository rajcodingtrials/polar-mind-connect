-- Allow therapists to update lesson_plan for linked parents
-- This creates a SECURITY DEFINER function that checks if the therapist is linked to the parent

-- Function to update lesson plan for a linked parent
CREATE OR REPLACE FUNCTION public.update_parent_lesson_plan(
  _parent_user_id UUID,
  _lesson_plan TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is a therapist
  IF NOT EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only therapists can update lesson plans for linked parents';
  END IF;

  -- Check if the therapist is linked to this parent
  IF NOT EXISTS (
    SELECT 1 FROM public.linked_parents lp
    INNER JOIN public.therapists t ON t.id = lp.therapist_id
    WHERE lp.parent_user_id = _parent_user_id
      AND t.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Therapist is not linked to this parent';
  END IF;

  -- Update or insert the lesson plan
  INSERT INTO public.parents (user_id, lesson_plan, created_at, updated_at)
  VALUES (_parent_user_id, _lesson_plan, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    lesson_plan = _lesson_plan,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_parent_lesson_plan(UUID, TEXT) TO authenticated;

-- Function to get lesson plan for a linked parent (for therapists)
CREATE OR REPLACE FUNCTION public.get_parent_lesson_plan(
  _parent_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lesson_plan TEXT;
BEGIN
  -- Check if the current user is a therapist
  IF NOT EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only therapists can read lesson plans for linked parents';
  END IF;

  -- Check if the therapist is linked to this parent
  IF NOT EXISTS (
    SELECT 1 FROM public.linked_parents lp
    INNER JOIN public.therapists t ON t.id = lp.therapist_id
    WHERE lp.parent_user_id = _parent_user_id
      AND t.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Therapist is not linked to this parent';
  END IF;

  -- Get the lesson plan
  SELECT lesson_plan INTO _lesson_plan
  FROM public.parents
  WHERE user_id = _parent_user_id;

  RETURN COALESCE(_lesson_plan, '');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_parent_lesson_plan(UUID) TO authenticated;

