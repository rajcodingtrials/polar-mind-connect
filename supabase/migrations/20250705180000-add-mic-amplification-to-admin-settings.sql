-- Add mic amplification settings to admin_settings
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS amplify_mic BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS mic_gain FLOAT8 NOT NULL DEFAULT 1.0; 