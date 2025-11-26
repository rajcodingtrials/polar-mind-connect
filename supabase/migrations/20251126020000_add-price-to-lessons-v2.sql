-- Add price column to lessons_v2 table
ALTER TABLE lessons_v2
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0 NOT NULL;

-- Set price to 0 for all existing rows
UPDATE lessons_v2
SET price = 0
WHERE price IS NULL;

