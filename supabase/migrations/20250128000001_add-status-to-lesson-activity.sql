-- Add status column to lesson_activity table
ALTER TABLE public.lesson_activity
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'started' NOT NULL CHECK (status IN ('started', 'complete'));

-- Update existing records to have 'complete' status (assuming they were completed)
UPDATE public.lesson_activity
SET status = 'complete'
WHERE status IS NULL OR status = '';

-- Set default for new records
ALTER TABLE public.lesson_activity
ALTER COLUMN status SET DEFAULT 'started';

