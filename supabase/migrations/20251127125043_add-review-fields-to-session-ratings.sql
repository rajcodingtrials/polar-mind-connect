-- Add new review fields to session_ratings table
ALTER TABLE session_ratings 
ADD COLUMN IF NOT EXISTS overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
ADD COLUMN IF NOT EXISTS usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
ADD COLUMN IF NOT EXISTS what_went_well TEXT,
ADD COLUMN IF NOT EXISTS what_can_be_improved TEXT;

-- Update existing records: if rating exists, set overall_rating to rating value
UPDATE session_ratings 
SET overall_rating = rating 
WHERE overall_rating IS NULL AND rating IS NOT NULL;

-- Set default for would_recommend if it doesn't exist (it already exists, but ensure it defaults to true)
-- would_recommend already exists, so we just need to ensure the new fields are properly set

