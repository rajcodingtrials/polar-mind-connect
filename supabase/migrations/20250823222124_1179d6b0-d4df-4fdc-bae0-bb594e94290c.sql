-- Add therapist_id to session_ratings table for better query performance
ALTER TABLE session_ratings 
ADD COLUMN therapist_id UUID REFERENCES therapists(id);

-- Create index for better performance
CREATE INDEX idx_session_ratings_therapist_id ON session_ratings(therapist_id);

-- Update existing records to populate therapist_id
UPDATE session_ratings 
SET therapist_id = ts.therapist_id
FROM therapy_sessions ts 
WHERE session_ratings.session_id = ts.id;