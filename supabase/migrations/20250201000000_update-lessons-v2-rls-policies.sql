-- Update RLS policies for lessons_v2 table
-- 1. Allow therapist role to insert and update rows
-- 2. Only allow therapist_admin role to delete rows
-- 3. Allow therapist, therapist_admin, parent, and parent_admin roles to view content

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read verified lessons_v2" ON lessons_v2;
DROP POLICY IF EXISTS "Allow content creators to insert lessons_v2" ON lessons_v2;
DROP POLICY IF EXISTS "Allow content creators to update lessons_v2" ON lessons_v2;
DROP POLICY IF EXISTS "Allow admins to manage lessons_v2" ON lessons_v2;

-- Policy 1: Allow therapist, therapist_admin, parent, and parent_admin roles to view lessons_v2
CREATE POLICY "Allow therapists and parents to view lessons_v2" ON lessons_v2
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      public.is_therapist(auth.uid()) OR 
      public.is_parent(auth.uid())
    )
  );

-- Policy 2: Allow therapist role to insert rows
CREATE POLICY "Allow therapists to insert lessons_v2" ON lessons_v2
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('therapist'::app_role, 'therapist_admin'::app_role)
    )
  );

-- Policy 3: Allow therapist role to update rows
CREATE POLICY "Allow therapists to update lessons_v2" ON lessons_v2
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('therapist'::app_role, 'therapist_admin'::app_role)
    )
  );

-- Policy 4: Only allow therapist_admin role to delete rows
CREATE POLICY "Allow therapist_admin to delete lessons_v2" ON lessons_v2
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'therapist_admin'::app_role
    )
  );

