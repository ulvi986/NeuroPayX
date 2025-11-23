-- Fix the handle_new_user function to properly set avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  first_letter TEXT;
  avatar_url TEXT;
BEGIN
  -- Extract first letter of email for avatar
  first_letter := UPPER(SUBSTRING(NEW.email FROM 1 FOR 1));
  
  -- Generate avatar URL using UI Avatars service with proper URL encoding
  avatar_url := 'https://ui-avatars.com/api/?name=' || first_letter || '&background=0D8ABC&color=fff&size=200';
  
  -- Insert profile with avatar
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    avatar_url
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Update existing profiles with avatars
UPDATE public.profiles 
SET avatar_url = 'https://ui-avatars.com/api/?name=' || UPPER(SUBSTRING(email FROM 1 FOR 1)) || '&background=0D8ABC&color=fff&size=200'
WHERE avatar_url IS NULL;