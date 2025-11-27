-- Add is_default column to lessons_v2 table
ALTER TABLE lessons_v2 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false NOT NULL;

-- Update existing rows to have is_default = false (already the default, but explicit for clarity)
UPDATE lessons_v2 
SET is_default = false 
WHERE is_default IS NULL;

