-- Add publish_to_marketplace column to lessons_v2 table
ALTER TABLE lessons_v2
ADD COLUMN publish_to_marketplace BOOLEAN DEFAULT false NOT NULL;

