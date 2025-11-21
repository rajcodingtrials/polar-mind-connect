-- Add Zoom meeting fields to therapy_sessions table
ALTER TABLE public.therapy_sessions
ADD COLUMN meeting_link TEXT,
ADD COLUMN zoom_meeting_id TEXT,
ADD COLUMN zoom_password TEXT;