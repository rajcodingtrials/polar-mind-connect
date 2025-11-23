-- Create parents table
CREATE TABLE public.parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  lessons TEXT, -- Comma-separated list of lesson IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for better performance
CREATE INDEX idx_parents_user_id ON public.parents(user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON public.parents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on parents table
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- Allow parents to view their own record
CREATE POLICY "Parents can view their own record" ON public.parents
  FOR SELECT USING (auth.uid() = user_id);

-- Allow parents to insert their own record
CREATE POLICY "Parents can insert their own record" ON public.parents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow parents to update their own record
CREATE POLICY "Parents can update their own record" ON public.parents
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to manage all parent records
CREATE POLICY "Admins can manage all parent records" ON public.parents
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

