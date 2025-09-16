-- Add reminder_sent column for email reminders
ALTER TABLE public.therapy_sessions
ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;

-- Helpful indexes for reminder lookups
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_reminder_pending
  ON public.therapy_sessions (session_date, status, reminder_sent);
