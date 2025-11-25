-- Create a function to get default lessons
-- This acts as a constant/enum-like value for default lesson IDs
CREATE OR REPLACE FUNCTION public.get_default_lessons()
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT '1ad57f79-ea9f-4894-8765-34083fb57f4f,284fef51-e2d0-407d-8930-de6184391899,300a36ac-beaa-46b3-b4e0-e076a0f2ac04,31eb7a4d-8ffc-40b0-8677-b10a0dceee5e,386985d6-3112-49bc-bca6-00939178d13e,40f0b51c-f17b-44ad-b65d-378ae8c71e33,52157e52-cb71-4ef5-8d9f-4873712c8058,6efb2910-6cc7-43fe-9198-410b28f6b2be,80f72e1b-f7b8-4b60-8719-cbf9dfa8da09,a581ab8a-a167-40f0-a778-7d94c28d4407,a9ce2a9c-f34b-4d65-a32b-e8172925e406,b7ff0731-c0a3-43a4-9d15-efc911a9ce60,c251fd3d-bc3f-4954-8c2b-8293d3aad96d,d6d77133-e396-4797-a728-cbff7ccaf0c8,d91592cc-c1ac-4cb2-8a9d-c0cd91b7d6da,d9a7e61e-e606-416b-a743-f9121de461c4';
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_default_lessons() TO authenticated;

