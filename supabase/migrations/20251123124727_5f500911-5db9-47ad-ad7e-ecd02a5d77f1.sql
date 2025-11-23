-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'creator', 'consultant', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_images table
CREATE TABLE public.template_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_ratings table
CREATE TABLE public.template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Create template_comments table
CREATE TABLE public.template_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_purchases table
CREATE TABLE public.template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Create consultants table
CREATE TABLE public.consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  photo_url TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultant_comments table
CREATE TABLE public.consultant_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES public.consultants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultant_ratings table
CREATE TABLE public.consultant_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES public.consultants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consultant_id, user_id)
);

-- Create consultation_requests table
CREATE TABLE public.consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES public.consultants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_members table
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('consultants', 'consultants', true);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to calculate average template rating
CREATE OR REPLACE FUNCTION public.get_template_avg_rating(template_id UUID)
RETURNS DECIMAL
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.template_ratings
  WHERE template_ratings.template_id = $1
$$;

-- Create function to calculate average consultant rating
CREATE OR REPLACE FUNCTION public.get_consultant_avg_rating(consultant_id UUID)
RETURNS DECIMAL
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM public.consultant_ratings
  WHERE consultant_ratings.consultant_id = $1
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_comments_updated_at BEFORE UPDATE ON public.template_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultants_updated_at BEFORE UPDATE ON public.consultants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultant_comments_updated_at BEFORE UPDATE ON public.consultant_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for templates
CREATE POLICY "Templates are viewable by everyone" ON public.templates
  FOR SELECT USING (true);

CREATE POLICY "Creators can insert templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND public.has_role(auth.uid(), 'creator'));

CREATE POLICY "Creators can update own templates" ON public.templates
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own templates" ON public.templates
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for template_images
CREATE POLICY "Template images are viewable by everyone" ON public.template_images
  FOR SELECT USING (true);

CREATE POLICY "Creators can insert template images" ON public.template_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.templates
      WHERE templates.id = template_images.template_id
      AND templates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can delete own template images" ON public.template_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.templates
      WHERE templates.id = template_images.template_id
      AND templates.creator_id = auth.uid()
    )
  );

-- RLS Policies for template_ratings
CREATE POLICY "Template ratings are viewable by everyone" ON public.template_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON public.template_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.template_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON public.template_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for template_comments
CREATE POLICY "Template comments are viewable by everyone" ON public.template_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments" ON public.template_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.template_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.template_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for template_purchases
CREATE POLICY "Users can view own purchases" ON public.template_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON public.template_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for consultants
CREATE POLICY "Consultants are viewable by everyone" ON public.consultants
  FOR SELECT USING (true);

CREATE POLICY "Consultants can insert own profile" ON public.consultants
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'consultant'));

CREATE POLICY "Consultants can update own profile" ON public.consultants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Consultants can delete own profile" ON public.consultants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for consultant_comments
CREATE POLICY "Consultant comments are viewable by everyone" ON public.consultant_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert consultant comments" ON public.consultant_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultant comments" ON public.consultant_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own consultant comments" ON public.consultant_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for consultant_ratings
CREATE POLICY "Consultant ratings are viewable by everyone" ON public.consultant_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert consultant ratings" ON public.consultant_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultant ratings" ON public.consultant_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own consultant ratings" ON public.consultant_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for consultation_requests
CREATE POLICY "Users can view own consultation requests" ON public.consultation_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Consultants can view their consultation requests" ON public.consultation_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultants
      WHERE consultants.id = consultation_requests.consultant_id
      AND consultants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert consultation requests" ON public.consultation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for communities
CREATE POLICY "Communities are viewable by everyone" ON public.communities
  FOR SELECT USING (true);

-- RLS Policies for community_members
CREATE POLICY "Community members are viewable by everyone" ON public.community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for templates bucket
CREATE POLICY "Template images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'templates');

CREATE POLICY "Creators can upload template images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'templates' AND
    public.has_role(auth.uid(), 'creator')
  );

CREATE POLICY "Creators can update template images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'templates' AND
    public.has_role(auth.uid(), 'creator')
  );

CREATE POLICY "Creators can delete template images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'templates' AND
    public.has_role(auth.uid(), 'creator')
  );

-- Storage policies for consultants bucket
CREATE POLICY "Consultant images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'consultants');

CREATE POLICY "Consultants can upload their photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'consultants' AND
    public.has_role(auth.uid(), 'consultant')
  );

CREATE POLICY "Consultants can update their photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'consultants' AND
    public.has_role(auth.uid(), 'consultant')
  );

CREATE POLICY "Consultants can delete their photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'consultants' AND
    public.has_role(auth.uid(), 'consultant')
  );

-- Insert default communities
INSERT INTO public.communities (name, description) VALUES
  ('AI Developers', 'Community for AI and machine learning developers'),
  ('Data Scientists', 'Community for data science professionals'),
  ('Frontend Developers', 'Community for frontend web developers'),
  ('Backend Developers', 'Community for backend and systems developers');