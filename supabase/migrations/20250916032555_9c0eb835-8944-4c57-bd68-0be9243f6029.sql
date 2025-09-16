-- Harden function search_path per linter recommendation
ALTER FUNCTION public.update_voice_profile_updated_at() SET search_path TO public;
ALTER FUNCTION public.update_voice_profile_sample_count() SET search_path TO public;