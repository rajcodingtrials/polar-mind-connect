-- Allow therapists to record lesson activity for linked parents
-- This creates a SECURITY DEFINER function that checks if the therapist is linked to the parent

-- Function to upsert lesson activity for a linked parent
CREATE OR REPLACE FUNCTION public.upsert_lesson_activity_for_linked_parent(
  _parent_user_id UUID,
  _lesson_id UUID,
  _status TEXT,
  _completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _activity_id UUID;
BEGIN
  -- Check if the current user is a therapist
  IF NOT EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only therapists can record lesson activity for linked parents';
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

  -- Validate status
  IF _status NOT IN ('started', 'complete') THEN
    RAISE EXCEPTION 'Status must be either "started" or "complete"';
  END IF;

  -- Upsert the lesson activity
  INSERT INTO public.lesson_activity (
    user_id,
    lesson_id,
    status,
    completed_at,
    created_at,
    updated_at
  )
  VALUES (
    _parent_user_id,
    _lesson_id,
    _status,
    CASE 
      WHEN _status = 'complete' AND _completed_at IS NOT NULL THEN _completed_at
      WHEN _status = 'complete' THEN NOW()
      ELSE NULL
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    status = _status,
    completed_at = CASE 
      WHEN _status = 'complete' AND _completed_at IS NOT NULL THEN _completed_at
      WHEN _status = 'complete' AND lesson_activity.completed_at IS NULL THEN NOW()
      WHEN _status = 'complete' THEN lesson_activity.completed_at
      ELSE lesson_activity.completed_at
    END,
    updated_at = NOW()
  RETURNING id INTO _activity_id;

  RETURN _activity_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_lesson_activity_for_linked_parent(UUID, UUID, TEXT, TIMESTAMP WITH TIME ZONE) TO authenticated;

