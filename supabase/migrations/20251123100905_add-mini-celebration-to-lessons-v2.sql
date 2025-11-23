-- Add add_mini_celebration column to lessons_v2 table
ALTER TABLE lessons_v2
ADD COLUMN add_mini_celebration BOOLEAN DEFAULT true NOT NULL;

