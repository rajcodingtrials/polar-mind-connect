-- Function: get_booked_slots - returns booked time ranges for a therapist on a given date
CREATE OR REPLACE FUNCTION public.get_booked_slots(
  _therapist_id uuid,
  _session_date date
)
RETURNS TABLE(start_time time without time zone, end_time time without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  RETURN QUERY
  SELECT ts.start_time, ts.end_time
  FROM public.therapy_sessions ts
  WHERE ts.therapist_id = _therapist_id
    AND ts.session_date = _session_date
    AND ts.status IN ('pending', 'confirmed', 'completed');
END;
$$;