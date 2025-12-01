-- Add use_ai_therapist column to therapists table
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS use_ai_therapist BOOLEAN NOT NULL DEFAULT true;

-- Migrate existing data from profiles table to therapists table
-- For therapists, copy the value from profiles.use_ai_therapist to therapists.use_ai_therapist
UPDATE public.therapists t
SET use_ai_therapist = COALESCE(
  (SELECT p.use_ai_therapist 
   FROM public.profiles p 
   WHERE p.id = t.user_id),
  true
)
WHERE EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = t.user_id
);

