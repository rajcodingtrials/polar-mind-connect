
-- Revert the storage paths back to .png extension to match actual PNG files
UPDATE public.cartoon_characters 
SET storage_path = REPLACE(storage_path, '.jpg', '.png');
