-- Check what metadata we have in auth.users and update profiles with available data
UPDATE public.profiles 
SET 
  email = COALESCE(
    (SELECT email FROM auth.users WHERE auth.users.id = profiles.id), 
    profiles.email
  ),
  username = COALESCE(
    (SELECT raw_user_meta_data ->> 'username' FROM auth.users WHERE auth.users.id = profiles.id),
    profiles.username
  ),
  name = COALESCE(
    (SELECT raw_user_meta_data ->> 'name' FROM auth.users WHERE auth.users.id = profiles.id),
    profiles.name
  ),
  age = COALESCE(
    (SELECT (raw_user_meta_data ->> 'age')::integer FROM auth.users WHERE auth.users.id = profiles.id),
    profiles.age
  )
WHERE EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id);