
-- Create a profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'User')
  );
  RETURN new;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login = now(), updated_at = now()
  WHERE id = user_id;
END;
$$;

-- Update existing documents table to use authenticated users
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_user_id_check;
DROP POLICY IF EXISTS "Allow anonymous access to documents" ON public.documents;

-- Create new RLS policies for authenticated users
CREATE POLICY "Users can view their own documents" 
  ON public.documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
  ON public.documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON public.documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update other tables for authenticated users
DROP POLICY IF EXISTS "Allow anonymous access to entities" ON public.entities;
CREATE POLICY "Users can manage their own entities" 
  ON public.entities 
  FOR ALL 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow anonymous access to custom document types" ON public.custom_document_types;
CREATE POLICY "Users can manage their own custom document types" 
  ON public.custom_document_types 
  FOR ALL 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow anonymous access to user settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings" 
  ON public.user_settings 
  FOR ALL 
  USING (auth.uid() = user_id);
