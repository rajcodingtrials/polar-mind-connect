-- Set default values for hourly_rate_30min and hourly_rate_60min in therapists table
-- This ensures all new therapists have default rates of $10 for 30min and $20 for 60min

-- Add default values to the columns
ALTER TABLE public.therapists 
ALTER COLUMN hourly_rate_30min SET DEFAULT 10.00;

ALTER TABLE public.therapists 
ALTER COLUMN hourly_rate_60min SET DEFAULT 20.00;

-- Update existing therapists that have NULL rates to use the defaults
UPDATE public.therapists
SET 
  hourly_rate_30min = COALESCE(hourly_rate_30min, 10.00),
  hourly_rate_60min = COALESCE(hourly_rate_60min, 20.00)
WHERE hourly_rate_30min IS NULL OR hourly_rate_60min IS NULL;

