
-- Move all inactive prompt configurations to prompt_history table
INSERT INTO public.prompt_history (
  original_prompt_id,
  prompt_type,
  content,
  created_at,
  updated_at,
  created_by,
  archived_at,
  archived_by
)
SELECT 
  id as original_prompt_id,
  prompt_type,
  content,
  created_at,
  updated_at,
  created_by,
  now() as archived_at,
  created_by as archived_by
FROM public.prompt_configurations
WHERE is_active = FALSE;

-- Delete the inactive rows from prompt_configurations
DELETE FROM public.prompt_configurations 
WHERE is_active = FALSE;
