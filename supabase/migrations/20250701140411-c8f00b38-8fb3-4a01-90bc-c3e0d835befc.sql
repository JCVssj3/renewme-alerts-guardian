
-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
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
  user_id UUID,
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
  user_id UUID,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
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

-- Create RLS policies for documents (allow anonymous access)
CREATE POLICY "Allow anonymous access to documents" 
  ON public.documents 
  FOR ALL 
  USING (user_id IS NULL);

-- Create RLS policies for entities (allow anonymous access)
CREATE POLICY "Allow anonymous access to entities" 
  ON public.entities 
  FOR ALL 
  USING (user_id IS NULL);

-- Create RLS policies for custom document types (allow anonymous access)
CREATE POLICY "Allow anonymous access to custom document types" 
  ON public.custom_document_types 
  FOR ALL 
  USING (user_id IS NULL);

-- Create RLS policies for user settings (allow anonymous access)
CREATE POLICY "Allow anonymous access to user settings" 
  ON public.user_settings 
  FOR ALL 
  USING (user_id IS NULL);

-- Create storage policies for document images (public access)
CREATE POLICY "Allow public access to document images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'document-images');

-- Insert default 'self' entity
INSERT INTO public.entities (id, user_id, name, tag, icon, color)
VALUES ('self', NULL, 'Myself', 'Personal', '👤', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
