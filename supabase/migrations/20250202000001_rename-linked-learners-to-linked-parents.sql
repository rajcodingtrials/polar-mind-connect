-- Rename linked_learners table to linked_parents
ALTER TABLE IF EXISTS public.linked_learners RENAME TO linked_parents;

-- Add is_active column to linked_parents table
ALTER TABLE IF EXISTS public.linked_parents 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster lookups on is_active
CREATE INDEX IF NOT EXISTS idx_linked_parents_is_active ON public.linked_parents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_linked_parents_therapist_active ON public.linked_parents(therapist_id, is_active) WHERE is_active = true;

-- Drop old policies
DROP POLICY IF EXISTS "Therapists can view their linked learners" ON public.linked_parents;
DROP POLICY IF EXISTS "Parents can view their linked therapists" ON public.linked_parents;
DROP POLICY IF EXISTS "Therapists can link learners" ON public.linked_parents;
DROP POLICY IF EXISTS "Therapists can unlink learners" ON public.linked_parents;
DROP POLICY IF EXISTS "Admins can manage all links" ON public.linked_parents;

-- Recreate RLS Policies for linked_parents
-- Therapists can view their linked parents
CREATE POLICY "Therapists can view their linked parents" 
ON public.linked_parents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = linked_parents.therapist_id 
    AND therapists.user_id = auth.uid()
  )
);

-- Parents can view which therapists they're linked to
CREATE POLICY "Parents can view their linked therapists" 
ON public.linked_parents 
FOR SELECT 
USING (auth.uid() = parent_user_id);

-- Therapists can create links (when they successfully link with a code)
CREATE POLICY "Therapists can link parents" 
ON public.linked_parents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = linked_parents.therapist_id 
    AND therapists.user_id = auth.uid()
  )
);

-- Therapists can update their own links (for activation/deactivation)
CREATE POLICY "Therapists can update their linked parents" 
ON public.linked_parents 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = linked_parents.therapist_id 
    AND therapists.user_id = auth.uid()
  )
);

-- Therapists can delete their own links
CREATE POLICY "Therapists can unlink parents" 
ON public.linked_parents 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = linked_parents.therapist_id 
    AND therapists.user_id = auth.uid()
  )
);

-- Admins can manage all links
CREATE POLICY "Admins can manage all links" 
ON public.linked_parents 
FOR ALL 
USING (public.is_admin(auth.uid()));

