-- Fix RLS policies for lessons_v2 to allow content creators to upload lessons
-- even if their is_active or is_verified fields are FALSE
-- 
-- The issue: The EXISTS subquery in the RLS policy is subject to RLS on the therapists table.
-- If a therapist has is_active = false, they might not be able to see their own row,
-- causing the policy check to fail.
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to check content creator status

-- Create a function to check if a user is a content creator
-- This function runs with SECURITY DEFINER, so it bypasses RLS on the therapists table
CREATE OR REPLACE FUNCTION public.is_content_creator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.therapists
    WHERE user_id = _user_id
      AND is_content_creator = true
  )
$$;

-- Drop existing policies that use the direct EXISTS query
DROP POLICY IF EXISTS "Allow content creators to insert lessons_v2" ON lessons_v2;
DROP POLICY IF EXISTS "Allow content creators to update lessons_v2" ON lessons_v2;

-- Recreate the insert policy using the SECURITY DEFINER function
CREATE POLICY "Allow content creators to insert lessons_v2" ON lessons_v2
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    public.is_content_creator(auth.uid())
  );

-- Recreate the update policy using the SECURITY DEFINER function
CREATE POLICY "Allow content creators to update lessons_v2" ON lessons_v2
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    public.is_content_creator(auth.uid())
  );

-- Also update the questions_v2 policies to use the same function for consistency
DROP POLICY IF EXISTS "Allow content creators to insert questions_v2" ON questions_v2;
DROP POLICY IF EXISTS "Allow content creators to update questions_v2" ON questions_v2;
DROP POLICY IF EXISTS "Allow content creators to delete questions_v2" ON questions_v2;

-- Recreate questions_v2 policies using the SECURITY DEFINER function
CREATE POLICY "Allow content creators to insert questions_v2" ON questions_v2
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid() AND
    public.is_content_creator(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM lessons_v2 
      WHERE lessons_v2.id = questions_v2.lesson_id
    )
  );

CREATE POLICY "Allow content creators to update questions_v2" ON questions_v2
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid() AND
    public.is_content_creator(auth.uid())
  );

CREATE POLICY "Allow content creators to delete questions_v2" ON questions_v2
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid() AND
    public.is_content_creator(auth.uid())
  );

