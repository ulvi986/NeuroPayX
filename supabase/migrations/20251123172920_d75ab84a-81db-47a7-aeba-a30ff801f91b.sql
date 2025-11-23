-- Add ip_address column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Update the handle_new_user function to capture IP from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  first_letter TEXT;
  avatar_url TEXT;
  user_ip TEXT;
BEGIN
  -- Extract first letter of email for avatar
  first_letter := UPPER(SUBSTRING(NEW.email FROM 1 FOR 1));
  
  -- Generate avatar URL using UI Avatars service
  avatar_url := 'https://ui-avatars.com/api/?name=' || first_letter || '&background=0D8ABC&color=fff&size=200';
  
  -- Extract IP address from user metadata
  user_ip := NEW.raw_user_meta_data->>'ip_address';
  
  -- Insert profile with avatar and IP
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url, ip_address)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    avatar_url,
    user_ip
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;