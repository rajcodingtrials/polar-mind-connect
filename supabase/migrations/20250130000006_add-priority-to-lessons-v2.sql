-- Add priority column to lessons_v2 table
ALTER TABLE public.lessons_v2 
ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;

-- Create index for better performance when sorting by priority
CREATE INDEX IF NOT EXISTS idx_lessons_v2_priority ON public.lessons_v2(priority DESC);

