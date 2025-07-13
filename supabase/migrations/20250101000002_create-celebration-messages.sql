-- Create celebration_messages table for storing multiple personalized messages
CREATE TABLE public.celebration_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_type TEXT NOT NULL CHECK (message_type IN ('tts_audio', 'question_feedback', 'celebration_visual')),
  therapist_name TEXT NOT NULL,
  message_category TEXT NOT NULL CHECK (message_category IN ('correct_answer', 'retry_encouragement', 'session_complete', 'milestone', 'streak')),
  progress_level INTEGER NOT NULL DEFAULT 1 CHECK (progress_level >= 1 AND progress_level <= 5),
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_celebration_messages_type ON public.celebration_messages(message_type);
CREATE INDEX idx_celebration_messages_therapist ON public.celebration_messages(therapist_name);
CREATE INDEX idx_celebration_messages_category ON public.celebration_messages(message_category);
CREATE INDEX idx_celebration_messages_active ON public.celebration_messages(is_active);
CREATE INDEX idx_celebration_messages_priority ON public.celebration_messages(priority);

-- Enable Row Level Security
ALTER TABLE public.celebration_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for celebration_messages
CREATE POLICY "Authenticated users can view active celebration messages" 
  ON public.celebration_messages 
  FOR SELECT 
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can manage celebration messages" 
  ON public.celebration_messages 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default celebration messages for Laura (warm, nurturing style)
INSERT INTO public.celebration_messages (message_type, therapist_name, message_category, progress_level, content, priority) VALUES
-- TTS Audio Messages (Laura)
('tts_audio', 'Laura', 'correct_answer', 1, 'Good job! You got it right!', 1),
('tts_audio', 'Laura', 'correct_answer', 1, 'Well done! That''s correct!', 2),
('tts_audio', 'Laura', 'correct_answer', 2, 'Great work! You''re doing well!', 1),
('tts_audio', 'Laura', 'correct_answer', 2, 'Excellent! You''re learning fast!', 2),
('tts_audio', 'Laura', 'correct_answer', 3, 'Amazing! You''re on fire!', 1),
('tts_audio', 'Laura', 'correct_answer', 3, 'Fantastic! You''re unstoppable!', 2),
('tts_audio', 'Laura', 'correct_answer', 4, 'Wonderful! You''re incredible!', 1),
('tts_audio', 'Laura', 'correct_answer', 4, 'Brilliant! You''re a star!', 2),
('tts_audio', 'Laura', 'correct_answer', 5, 'Outstanding! You''ve completed everything!', 1),
('tts_audio', 'Laura', 'correct_answer', 5, 'Perfect! You''re a champion!', 2),

-- Question Feedback Messages (Laura)
('question_feedback', 'Laura', 'correct_answer', 1, 'Good job, {child_name}! That''s correct! 🎉', 1),
('question_feedback', 'Laura', 'correct_answer', 1, 'Well done, {child_name}! You got it right! ⭐', 2),
('question_feedback', 'Laura', 'correct_answer', 2, 'Great work, {child_name}! You''re learning fast! ⭐', 1),
('question_feedback', 'Laura', 'correct_answer', 2, 'Excellent, {child_name}! You''re doing so well! 🌟', 2),
('question_feedback', 'Laura', 'correct_answer', 3, 'Amazing, {child_name}! You''re on a roll! 🔥', 1),
('question_feedback', 'Laura', 'correct_answer', 3, 'Fantastic, {child_name}! You''re unstoppable! 🚀', 2),
('question_feedback', 'Laura', 'correct_answer', 4, 'Wonderful, {child_name}! You''re incredible! 💫', 1),
('question_feedback', 'Laura', 'correct_answer', 4, 'Brilliant, {child_name}! You''re a star! ⭐', 2),
('question_feedback', 'Laura', 'correct_answer', 5, 'Outstanding, {child_name}! You''ve mastered this session! 👑', 1),
('question_feedback', 'Laura', 'correct_answer', 5, 'Perfect, {child_name}! You''re a champion! 🏆', 2),

-- Celebration Visual Messages (Laura)
('celebration_visual', 'Laura', 'correct_answer', 1, '🎉 Good Job! 🎉', 1),
('celebration_visual', 'Laura', 'correct_answer', 2, '🌟 Great Work! 🌟', 1),
('celebration_visual', 'Laura', 'correct_answer', 3, '🔥 Amazing! 🔥', 1),
('celebration_visual', 'Laura', 'correct_answer', 4, '💫 Wonderful! 💫', 1),
('celebration_visual', 'Laura', 'correct_answer', 5, '👑 Outstanding! 👑', 1),

-- Insert default celebration messages for Lawrence (structured, educational style)
INSERT INTO public.celebration_messages (message_type, therapist_name, message_category, progress_level, content, priority) VALUES
-- TTS Audio Messages (Lawrence)
('tts_audio', 'Lawrence', 'correct_answer', 1, 'Excellent! That''s the right answer!', 1),
('tts_audio', 'Lawrence', 'correct_answer', 1, 'Perfect! You''ve got it!', 2),
('tts_audio', 'Lawrence', 'correct_answer', 2, 'Great progress! You''re improving!', 1),
('tts_audio', 'Lawrence', 'correct_answer', 2, 'Well done! Your learning is showing!', 2),
('tts_audio', 'Lawrence', 'correct_answer', 3, 'Impressive! You''re mastering this!', 1),
('tts_audio', 'Lawrence', 'correct_answer', 3, 'Outstanding! Your skills are growing!', 2),
('tts_audio', 'Lawrence', 'correct_answer', 4, 'Remarkable! You''re becoming an expert!', 1),
('tts_audio', 'Lawrence', 'correct_answer', 4, 'Exceptional! Your knowledge is expanding!', 2),
('tts_audio', 'Lawrence', 'correct_answer', 5, 'Superb! You''ve completed the session!', 1),
('tts_audio', 'Lawrence', 'correct_answer', 5, 'Magnificent! You''re a true learner!', 2),

-- Question Feedback Messages (Lawrence)
('question_feedback', 'Lawrence', 'correct_answer', 1, 'Excellent, {child_name}! That''s the right answer! 🎯', 1),
('question_feedback', 'Lawrence', 'correct_answer', 1, 'Perfect, {child_name}! You''ve got it! ✅', 2),
('question_feedback', 'Lawrence', 'correct_answer', 2, 'Great progress, {child_name}! You''re improving! 📈', 1),
('question_feedback', 'Lawrence', 'correct_answer', 2, 'Well done, {child_name}! Your learning is showing! 🧠', 2),
('question_feedback', 'Lawrence', 'correct_answer', 3, 'Impressive, {child_name}! You''re mastering this! 🎓', 1),
('question_feedback', 'Lawrence', 'correct_answer', 3, 'Outstanding, {child_name}! Your skills are growing! 🌱', 2),
('question_feedback', 'Lawrence', 'correct_answer', 4, 'Remarkable, {child_name}! You''re becoming an expert! 🏆', 1),
('question_feedback', 'Lawrence', 'correct_answer', 4, 'Exceptional, {child_name}! Your knowledge is expanding! 📚', 2),
('question_feedback', 'Lawrence', 'correct_answer', 5, 'Superb, {child_name}! You''ve completed the session! 🎊', 1),
('question_feedback', 'Lawrence', 'correct_answer', 5, 'Magnificent, {child_name}! You''re a true learner! 🏅', 2),

-- Celebration Visual Messages (Lawrence)
('celebration_visual', 'Lawrence', 'correct_answer', 1, '🎯 Excellent! 🎯', 1),
('celebration_visual', 'Lawrence', 'correct_answer', 2, '📈 Great Progress! 📈', 1),
('celebration_visual', 'Lawrence', 'correct_answer', 3, '🎓 Impressive! 🎓', 1),
('celebration_visual', 'Lawrence', 'correct_answer', 4, '🏆 Remarkable! 🏆', 1),
('celebration_visual', 'Lawrence', 'correct_answer', 5, '🎊 Superb! 🎊', 1);

-- Create a function to get random celebration message
CREATE OR REPLACE FUNCTION get_celebration_message(
  p_message_type TEXT,
  p_therapist_name TEXT,
  p_message_category TEXT,
  p_progress_level INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  selected_message TEXT;
BEGIN
  SELECT content INTO selected_message
  FROM public.celebration_messages
  WHERE message_type = p_message_type
    AND therapist_name = p_therapist_name
    AND message_category = p_message_category
    AND progress_level = p_progress_level
    AND is_active = true
  ORDER BY RANDOM()
  LIMIT 1;
  
  RETURN COALESCE(selected_message, 'Great job!');
END;
$$; 