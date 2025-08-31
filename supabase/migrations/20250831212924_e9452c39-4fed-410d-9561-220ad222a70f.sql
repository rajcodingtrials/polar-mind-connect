-- Create tap-specific feedback prompt configurations
INSERT INTO prompt_configurations (prompt_type, content, is_active, version, created_by) VALUES 
(
  'tap_feedback_correct',
  'Great job, {child_name}! You selected {correct_answer}! That''s absolutely correct! 🎉 Keep up the excellent work!',
  true,
  1,
  NULL
),
(
  'tap_feedback_incorrect', 
  'That''s not quite right, {child_name}. The correct answer is {correct_answer}. You can do it! Let''s try again! 💪',
  true,
  1,
  NULL
);