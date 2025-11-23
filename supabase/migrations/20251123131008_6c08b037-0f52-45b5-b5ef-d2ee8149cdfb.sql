-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Creators can insert templates" ON public.templates;

-- Create a new policy that allows any authenticated user to create templates
CREATE POLICY "Authenticated users can insert templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

-- Also update the profiles INSERT policy to allow users to be created
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);