-- Add reminder_time column to documents table
ALTER TABLE public.documents 
ADD COLUMN reminder_time TEXT DEFAULT '09:00';