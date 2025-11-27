-- Remove feedback_text and categories columns from session_ratings table
ALTER TABLE session_ratings
DROP COLUMN IF EXISTS feedback_text,
DROP COLUMN IF EXISTS categories;

