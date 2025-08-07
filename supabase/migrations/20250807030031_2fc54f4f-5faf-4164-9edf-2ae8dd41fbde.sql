-- First, extend app_role enum to include therapist
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'therapist';