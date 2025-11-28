-- Update get_booked_slots function to use 'paid' payment status
CREATE OR REPLACE FUNCTION public.get_booked_slots(_session_date date, _therapist_id uuid)
 RETURNS TABLE(start_time time without time zone, end_time time without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT ts.start_time, ts.end_time
  FROM public.therapy_sessions ts
  WHERE ts.therapist_id = _therapist_id
    AND ts.session_date = _session_date
    AND ts.payment_status = 'paid'
    AND ts.status != 'cancelled';
END;
$function$;