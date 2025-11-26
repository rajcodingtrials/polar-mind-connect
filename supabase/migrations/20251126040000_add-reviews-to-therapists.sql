-- Add reviews columns to therapists table
ALTER TABLE therapists
ADD COLUMN IF NOT EXISTS reviews TEXT DEFAULT '[5,5,5,5,5]',
ADD COLUMN IF NOT EXISTS num_reviews INTEGER DEFAULT 6 NOT NULL,
ADD COLUMN IF NOT EXISTS average_review DECIMAL(3, 1) DEFAULT 5.0 NOT NULL;

-- Set default values for all existing therapists
UPDATE therapists
SET 
  reviews = '[5,5,5,5,5]',
  num_reviews = 6,
  average_review = 5.0
WHERE reviews IS NULL OR num_reviews IS NULL OR average_review IS NULL;

