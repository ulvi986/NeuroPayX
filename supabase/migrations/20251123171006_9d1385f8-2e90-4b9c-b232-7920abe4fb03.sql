-- Drop the existing foreign key constraint to auth.users
ALTER TABLE public.templates 
DROP CONSTRAINT IF EXISTS templates_creator_id_fkey;

-- Add new foreign key constraint to public.profiles
ALTER TABLE public.templates 
ADD CONSTRAINT templates_creator_id_fkey 
FOREIGN KEY (creator_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;