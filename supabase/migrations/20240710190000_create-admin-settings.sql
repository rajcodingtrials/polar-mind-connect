-- Create admin_settings table for feature toggles
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skip_introduction BOOLEAN NOT NULL DEFAULT false,
  show_mic_input BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Only one row is expected; you can enforce this in the app logic.
-- Optionally, insert a default row:
INSERT INTO admin_settings (skip_introduction, show_mic_input) VALUES (false, false)
ON CONFLICT DO NOTHING;

-- RLS: Allow only admins to update/read
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read to authenticated" ON admin_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update to admins" ON admin_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin')
  ); 