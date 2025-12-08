-- Create activity_sessions table to track individual lesson sessions
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  session_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons_v2(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  num_questions_attempted INTEGER NOT NULL DEFAULT 0,
  num_questions_correct INTEGER NOT NULL DEFAULT 0,
  correct_question_index TEXT, -- Comma-separated list of question indices that were answered correctly
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_id ON public.activity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_lesson_id ON public.activity_sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_status ON public.activity_sessions(status);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_lesson ON public.activity_sessions(user_id, lesson_id);

-- Enable Row Level Security
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own activity sessions
CREATE POLICY "Users can view their own activity sessions" 
ON public.activity_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own activity sessions
CREATE POLICY "Users can insert their own activity sessions" 
ON public.activity_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity sessions
CREATE POLICY "Users can update their own activity sessions" 
ON public.activity_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Therapists can view activity sessions for their linked parents
CREATE POLICY "Therapists can view linked parent activity sessions" 
ON public.activity_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.linked_parents lp
    INNER JOIN public.therapists t ON t.id = lp.therapist_id
    WHERE lp.parent_user_id = activity_sessions.user_id
    AND t.user_id = auth.uid()
  )
);

-- Admins can manage all activity sessions
CREATE POLICY "Admins can manage all activity sessions" 
ON public.activity_sessions 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activity_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_activity_sessions_updated_at
BEFORE UPDATE ON public.activity_sessions
FOR EACH ROW
EXECUTE FUNCTION update_activity_sessions_updated_at();

