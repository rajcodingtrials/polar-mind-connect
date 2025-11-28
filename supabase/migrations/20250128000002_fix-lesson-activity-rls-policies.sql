-- Fix RLS policies for lesson_activity table
-- UPDATE policies need both USING and WITH CHECK clauses

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own lesson activity" ON public.lesson_activity;
DROP POLICY IF EXISTS "Users can insert their own lesson activity" ON public.lesson_activity;
DROP POLICY IF EXISTS "Users can update their own lesson activity" ON public.lesson_activity;

-- Recreate SELECT policy
CREATE POLICY "Users can view their own lesson activity" 
ON public.lesson_activity 
FOR SELECT 
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Recreate INSERT policy
CREATE POLICY "Users can insert their own lesson activity" 
ON public.lesson_activity 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Recreate UPDATE policy with both USING and WITH CHECK
CREATE POLICY "Users can update their own lesson activity" 
ON public.lesson_activity 
FOR UPDATE 
USING (auth.role() = 'authenticated' AND auth.uid() = user_id)
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

