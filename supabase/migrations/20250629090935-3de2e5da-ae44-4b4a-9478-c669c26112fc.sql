
-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_period TEXT NOT NULL,
  notes TEXT,
  image_url TEXT,
  entity_id TEXT DEFAULT 'self',
  is_handled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entities table
CREATE TABLE public.entities (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  tag TEXT,
  icon TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom document types table
CREATE TABLE public.custom_document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  notifications_sound BOOLEAN DEFAULT true,
  notifications_vibration BOOLEAN DEFAULT true,
  default_reminder_period TEXT DEFAULT '2_weeks',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for document images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('document-images', 'document-images', true);

-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" 
  ON public.documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
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

-- Create RLS policies for entities
CREATE POLICY "Users can view their own entities" 
  ON public.entities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entities" 
  ON public.entities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entities" 
  ON public.entities 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entities" 
  ON public.entities 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for custom document types
CREATE POLICY "Users can view their own custom document types" 
  ON public.custom_document_types 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom document types" 
  ON public.custom_document_types 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom document types" 
  ON public.custom_document_types 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom document types" 
  ON public.custom_document_types 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user settings
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage policies for document images
CREATE POLICY "Users can view document images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-images');

CREATE POLICY "Users can upload document images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'document-images');

CREATE POLICY "Users can update document images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'document-images');

CREATE POLICY "Users can delete document images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'document-images');
