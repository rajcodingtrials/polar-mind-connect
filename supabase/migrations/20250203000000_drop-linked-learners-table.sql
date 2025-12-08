-- Drop linked_learners table if it exists (it should have been renamed to linked_parents)
-- This migration is safe to run even if the table doesn't exist
DROP TABLE IF EXISTS public.linked_learners CASCADE;

