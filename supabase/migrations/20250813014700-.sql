-- Fix RLS policies for therapist profile creation
-- Remove the restrictive policy that requires therapist role
DROP POLICY IF EXISTS "Therapists can create their own profile" ON public.therapists;

-- Create a new policy that allows authenticated users to create their own therapist profile
CREATE POLICY "Users can create their own therapist profile" 
ON public.therapists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also ensure users can view their own profile during creation
-- The existing "Therapists can view their own profile" policy should be sufficient, but let's make sure
DROP POLICY IF EXISTS "Therapists can view their own profile" ON public.therapists;

CREATE POLICY "Users can view their own therapist profile" 
ON public.therapists 
FOR SELECT 
USING (auth.uid() = user_id);

-- Keep the update policy as is since it's working correctly
-- The policy "Therapists can update their own profile" should remain unchanged