-- Create parent_codes table to store active one-time codes for parents
CREATE TABLE IF NOT EXISTS public.parent_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by_therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  UNIQUE(code)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parent_codes_code ON public.parent_codes(code);
CREATE INDEX IF NOT EXISTS idx_parent_codes_parent_user_id ON public.parent_codes(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_codes_active ON public.parent_codes(is_active) WHERE is_active = true;

-- Create linked_parents table to store therapist-parent relationships
CREATE TABLE IF NOT EXISTS public.linked_parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  linked_by_code TEXT, -- Store the code that was used for linking
  is_active BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(therapist_id, parent_user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_linked_parents_therapist_id ON public.linked_parents(therapist_id);
CREATE INDEX IF NOT EXISTS idx_linked_parents_parent_user_id ON public.linked_parents(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_linked_parents_is_active ON public.linked_parents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_linked_parents_therapist_active ON public.linked_parents(therapist_id, is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.parent_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_parents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_codes
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Parents can view their own codes" ON public.parent_codes;
DROP POLICY IF EXISTS "Parents can create their own codes" ON public.parent_codes;
DROP POLICY IF EXISTS "Parents can update their own codes" ON public.parent_codes;
DROP POLICY IF EXISTS "Therapists can view active codes for linking" ON public.parent_codes;
DROP POLICY IF EXISTS "Admins can manage all codes" ON public.parent_codes;

-- Parents can view and manage their own codes
CREATE POLICY "Parents can view their own codes" 
ON public.parent_codes 
FOR SELECT 
USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can create their own codes" 
ON public.parent_codes 
FOR INSERT 
WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update their own codes" 
ON public.parent_codes 
FOR UPDATE 
USING (auth.uid() = parent_user_id);

-- Therapists can view active codes (to verify during linking)
-- But only if they're trying to link with a specific code
-- We'll handle this in the application logic, but allow therapists to read codes
CREATE POLICY "Therapists can view active codes for linking" 
ON public.parent_codes 
FOR SELECT 
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.user_id = auth.uid()
  )
);

-- Admins can manage all codes
CREATE POLICY "Admins can manage all codes" 
ON public.parent_codes 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS Policies for linked_parents
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Therapists can view their linked parents" ON public.linked_parents;
DROP POLICY IF EXISTS "Parents can view their linked therapists" ON public.linked_parents;
DROP POLICY IF EXISTS "Therapists can link parents" ON public.linked_parents;
DROP POLICY IF EXISTS "Therapists can update their linked parents" ON public.linked_parents;
DROP POLICY IF EXISTS "Therapists can unlink parents" ON public.linked_parents;
DROP POLICY IF EXISTS "Admins can manage all links" ON public.linked_parents;

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

-- Function to generate a random code
CREATE OR REPLACE FUNCTION public.generate_parent_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.parent_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to find user by email (for therapist linking)
-- This function allows therapists to look up parent users by email
CREATE OR REPLACE FUNCTION public.find_user_by_email(_email TEXT)
RETURNS TABLE(user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email::TEXT as email
  FROM auth.users au
  WHERE LOWER(au.email) = LOWER(_email)
  LIMIT 1;
END;
$$;

-- Function to get user details by user_id (for therapist viewing linked learners)
-- This function allows therapists to view parent user information
CREATE OR REPLACE FUNCTION public.get_user_details(_user_id UUID)
RETURNS TABLE(user_id UUID, email TEXT, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email::TEXT as email,
    COALESCE(
      au.raw_user_meta_data->>'name',
      au.raw_user_meta_data->>'full_name',
      split_part(au.email::TEXT, '@', 1)
    )::TEXT as name
  FROM auth.users au
  WHERE au.id = _user_id
  LIMIT 1;
END;
$$;

