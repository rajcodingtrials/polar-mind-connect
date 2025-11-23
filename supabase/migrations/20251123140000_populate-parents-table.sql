-- Populate parents table for all users who are not therapists
-- For every user in auth.users, if they don't have a record in therapists table,
-- add them to the parents table with the specified lessons

INSERT INTO public.parents (user_id, lessons)
SELECT 
  au.id as user_id,
  '1ad57f79-ea9f-4894-8765-34083fb57f4f,284fef51-e2d0-407d-8930-de6184391899,31eb7a4d-8ffc-40b0-8677-b10a0dceee5e,386985d6-3112-49bc-bca6-00939178d13e,40f0b51c-f17b-44ad-b65d-378ae8c71e33,4875e9ac-0d28-4376-9278-9fb93f0f6044,52157e52-cb71-4ef5-8d9f-4873712c8058,6efb2910-6cc7-43fe-9198-410b28f6b2be,80f72e1b-f7b8-4b60-8719-cbf9dfa8da09,a9ce2a9c-f34b-4d65-a32b-e8172925e406,b7ff0731-c0a3-43a4-9d15-efc911a9ce60,c251fd3d-bc3f-4954-8c2b-8293d3aad96d,d6d77133-e396-4797-a728-cbff7ccaf0c8,d91592cc-c1ac-4cb2-8a9d-c0cd91b7d6da' as lessons
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.therapists t 
  WHERE t.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

