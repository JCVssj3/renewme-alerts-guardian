-- This migration updates the existing user_settings table structure
-- to ensure proper type generation and fix any schema issues

-- Ensure the user_settings table exists with correct structure
DO $$ 
BEGIN
    -- Check if table exists and create if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings' AND table_schema = 'public') THEN
        CREATE TABLE public.user_settings (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID,
            theme TEXT NOT NULL DEFAULT 'system',
            notifications_enabled BOOLEAN NOT NULL DEFAULT true,
            notifications_sound BOOLEAN NOT NULL DEFAULT true,
            notifications_vibration BOOLEAN NOT NULL DEFAULT true,
            default_reminder_period TEXT NOT NULL DEFAULT '2_weeks',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
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

        CREATE POLICY "Allow anonymous access to settings" 
        ON public.user_settings 
        FOR ALL 
        USING (user_id IS NULL);
    END IF;
END $$;