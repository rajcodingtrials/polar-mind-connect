-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'parent';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'therapist_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'parent_admin';

-- Populate user_roles for existing users in parents table
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'parent'::app_role
FROM public.parents p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Populate user_roles for existing users in therapists table
INSERT INTO public.user_roles (user_id, role)
SELECT t.user_id, 'therapist'::app_role
FROM public.therapists t
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = t.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Migrate existing 'admin' roles to 'therapist_admin' (keeping admin for backward compatibility)
-- You can manually reassign specific admins to 'parent_admin' if needed
UPDATE public.user_roles
SET role = 'therapist_admin'::app_role
WHERE role = 'admin'::app_role
AND EXISTS (
  SELECT 1 FROM public.therapists t WHERE t.user_id = user_roles.user_id
);

-- For admins who are not therapists, set them as parent_admin
UPDATE public.user_roles
SET role = 'parent_admin'::app_role
WHERE role = 'admin'::app_role
AND NOT EXISTS (
  SELECT 1 FROM public.therapists t WHERE t.user_id = user_roles.user_id
);

-- Update the handle_therapist_signup function to also handle parent role assignment
CREATE OR REPLACE FUNCTION public.handle_therapist_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user metadata indicates therapist signup
  IF NEW.raw_user_meta_data->>'is_therapist' = 'true' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'therapist'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- If not a therapist, assign parent role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'parent'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Update has_role function to handle new admin roles
-- The function already works with the enum, so no changes needed
-- But we'll add a helper function to check if user is therapist (therapist or therapist_admin)
CREATE OR REPLACE FUNCTION public.is_therapist(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('therapist'::app_role, 'therapist_admin'::app_role)
  )
$$;

-- Helper function to check if user is parent (parent or parent_admin)
CREATE OR REPLACE FUNCTION public.is_parent(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('parent'::app_role, 'parent_admin'::app_role, 'user'::app_role)
  )
$$;

-- Helper function to check if user is admin (therapist_admin or parent_admin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('therapist_admin'::app_role, 'parent_admin'::app_role, 'admin'::app_role)
  )
$$;

-- Update RLS policies to use the new is_admin function
-- Update user_roles policies to allow therapist_admin and parent_admin to view all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

