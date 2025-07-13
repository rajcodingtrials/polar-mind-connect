
-- Update the storage paths to use .jpg extension instead of .png
UPDATE public.cartoon_characters 
SET storage_path = REPLACE(storage_path, '.png', '.jpg');
