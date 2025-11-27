-- Rename question_video_before to question_video
ALTER TABLE questions_v2 
RENAME COLUMN question_video_before TO question_video;

-- Rename question_video_after to video_after_answer
ALTER TABLE questions_v2 
RENAME COLUMN question_video_after TO video_after_answer;

