-- Add 'story_activity' to question_type_enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'question_type_enum' AND e.enumlabel = 'story_activity'
  ) THEN
    ALTER TYPE question_type_enum ADD VALUE 'story_activity';
  END IF;
END $$;

-- Add new columns to questions table for story activities
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS scene_image text,
ADD COLUMN IF NOT EXISTS scene_narration text,
ADD COLUMN IF NOT EXISTS sequence_number integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_scene boolean DEFAULT false;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_questions_lesson_sequence 
ON questions(lesson_id, sequence_number);

-- Add helpful comments
COMMENT ON COLUMN questions.scene_image IS 'Image filename for story scene display (story_activity only)';
COMMENT ON COLUMN questions.scene_narration IS 'TTS text to read during scene (story_activity only)';
COMMENT ON COLUMN questions.sequence_number IS 'Order in story: 1-9 for story_activity (odd=scene, even=question, 9=end scene)';
COMMENT ON COLUMN questions.is_scene IS 'true = scene display, false = question (story_activity only)';