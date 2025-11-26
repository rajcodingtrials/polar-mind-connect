-- Add reviews columns to lessons_v2 table
ALTER TABLE lessons_v2
ADD COLUMN IF NOT EXISTS reviews TEXT DEFAULT '4.9,4.9,4.9,4.9,4.9',
ADD COLUMN IF NOT EXISTS num_reviews INTEGER DEFAULT 5 NOT NULL,
ADD COLUMN IF NOT EXISTS average_review DECIMAL(3, 1) DEFAULT 4.9 NOT NULL;

-- Set default values for all existing lessons
UPDATE lessons_v2
SET 
  reviews = '4.9,4.9,4.9,4.9,4.9',
  num_reviews = 5,
  average_review = 4.9
WHERE reviews IS NULL OR num_reviews IS NULL OR average_review IS NULL;

