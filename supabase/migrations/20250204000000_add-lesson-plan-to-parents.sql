-- Add lesson_plan column to parents table
ALTER TABLE public.parents
ADD COLUMN IF NOT EXISTS lesson_plan TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.parents.lesson_plan IS 'Comma-separated list of lesson IDs for personalized lesson plan';

