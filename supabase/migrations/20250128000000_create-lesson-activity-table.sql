-- Create lesson_activity table to track lesson attempts and reviews
CREATE TABLE IF NOT EXISTS public.lesson_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons_v2(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Review fields
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  would_recommend BOOLEAN DEFAULT NULL,
  what_went_well TEXT,
  what_can_be_improved TEXT,
  
  -- Ensure one record per user per lesson (upsert on user_id + lesson_id)
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for lesson_activity
CREATE POLICY "Users can view their own lesson activity" 
ON public.lesson_activity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson activity" 
ON public.lesson_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson activity" 
ON public.lesson_activity 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_lesson_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_activity_updated_at
BEFORE UPDATE ON public.lesson_activity
FOR EACH ROW
EXECUTE FUNCTION update_lesson_activity_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lesson_activity_user_id ON public.lesson_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_activity_lesson_id ON public.lesson_activity(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_activity_completed_at ON public.lesson_activity(completed_at DESC);

