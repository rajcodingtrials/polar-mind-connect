
-- Fix RLS policies for cartoon_characters table
-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view cartoon characters" ON public.cartoon_characters;

-- Create proper RLS policies for cartoon_characters
CREATE POLICY "Users can view cartoon characters" 
  ON public.cartoon_characters 
  FOR SELECT 
  USING (true); -- Keep public read access for cartoon characters as they seem to be shared content

CREATE POLICY "Admins can manage cartoon characters" 
  ON public.cartoon_characters 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Fix RLS policies for questions table
-- Drop the existing overly broad policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.questions;

-- Create specific, restrictive policies for questions
CREATE POLICY "Authenticated users can view questions" 
  ON public.questions 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert questions" 
  ON public.questions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update questions" 
  ON public.questions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete questions" 
  ON public.questions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Standardize existing RLS policies to use the security definer function
-- Update prompt_configurations policies to use has_role function
DROP POLICY IF EXISTS "Admins can view prompt configurations" ON public.prompt_configurations;
DROP POLICY IF EXISTS "Admins can insert prompt configurations" ON public.prompt_configurations;
DROP POLICY IF EXISTS "Admins can update prompt configurations" ON public.prompt_configurations;

CREATE POLICY "Admins can view prompt configurations" 
  ON public.prompt_configurations 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert prompt configurations" 
  ON public.prompt_configurations 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prompt configurations" 
  ON public.prompt_configurations 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Update prompt_history policies to use has_role function
DROP POLICY IF EXISTS "Admins can view prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Admins can insert into prompt history" ON public.prompt_history;

CREATE POLICY "Admins can view prompt history" 
  ON public.prompt_history 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert into prompt history" 
  ON public.prompt_history 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update tts_settings policies to use has_role function
DROP POLICY IF EXISTS "Admins can view TTS settings" ON public.tts_settings;
DROP POLICY IF EXISTS "Admins can insert TTS settings" ON public.tts_settings;
DROP POLICY IF EXISTS "Admins can update TTS settings" ON public.tts_settings;

CREATE POLICY "Admins can view TTS settings" 
  ON public.tts_settings 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert TTS settings" 
  ON public.tts_settings 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update TTS settings" 
  ON public.tts_settings 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));
