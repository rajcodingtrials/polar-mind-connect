
-- Create a table for storing prompt history
CREATE TABLE public.prompt_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_prompt_id UUID NOT NULL,
  prompt_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_by UUID REFERENCES auth.users(id)
);

-- Add Row Level Security to prompt_history
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Create policies for prompt history (admins only)
CREATE POLICY "Admins can view prompt history" 
  ON public.prompt_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert into prompt history" 
  ON public.prompt_history 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add version tracking to prompt_configurations
ALTER TABLE public.prompt_configurations 
ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- Create index for better performance on history queries
CREATE INDEX idx_prompt_history_type_archived ON public.prompt_history (prompt_type, archived_at DESC);
CREATE INDEX idx_prompt_configurations_type_active ON public.prompt_configurations (prompt_type, is_active);
