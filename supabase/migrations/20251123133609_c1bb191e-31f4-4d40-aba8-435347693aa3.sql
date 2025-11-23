-- Create missing profiles for any auth users without them
INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  'https://ui-avatars.com/api/?name=' || UPPER(SUBSTRING(au.email FROM 1 FOR 1)) || '&background=0D8ABC&color=fff&size=200'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;