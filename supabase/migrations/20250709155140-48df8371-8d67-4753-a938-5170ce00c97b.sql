-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update user_tokens table to better handle FCM tokens
ALTER TABLE user_tokens 
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'android',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for better performance on token queries
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id_active ON user_tokens(user_id, is_active);

-- Create index for better performance on document queries for notifications
CREATE INDEX IF NOT EXISTS idx_documents_expiry_reminder ON documents(expiry_date, reminder_period, user_id);

-- Create a function to calculate reminder date
CREATE OR REPLACE FUNCTION calculate_reminder_date(expiry_date TIMESTAMP WITH TIME ZONE, reminder_period TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
BEGIN
    CASE reminder_period
        WHEN 'same_day' THEN RETURN expiry_date::date;
        WHEN '1_day' THEN RETURN (expiry_date::date - INTERVAL '1 day')::date;
        WHEN '3_days' THEN RETURN (expiry_date::date - INTERVAL '3 days')::date;
        WHEN '1_week' THEN RETURN (expiry_date::date - INTERVAL '1 week')::date;
        WHEN '2_weeks' THEN RETURN (expiry_date::date - INTERVAL '2 weeks')::date;
        WHEN '1_month' THEN RETURN (expiry_date::date - INTERVAL '1 month')::date;
        ELSE RETURN (expiry_date::date - INTERVAL '1 week')::date;
    END CASE;
END;
$$;

-- Create a view for documents that need reminders today
CREATE OR REPLACE VIEW documents_needing_reminders AS
SELECT 
    d.id,
    d.name,
    d.type,
    d.expiry_date,
    d.reminder_period,
    d.user_id,
    p.full_name
FROM documents d
JOIN profiles p ON d.user_id = p.id
WHERE 
    calculate_reminder_date(d.expiry_date, d.reminder_period)::date = CURRENT_DATE
    AND d.is_handled = false;

-- Create RLS policies for user_tokens table
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own tokens" ON user_tokens;
CREATE POLICY "Users can manage their own tokens" ON user_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Create a function to clean up old/inactive tokens
CREATE OR REPLACE FUNCTION cleanup_old_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Mark tokens as inactive if they haven't been updated in 30 days
    UPDATE user_tokens 
    SET is_active = false 
    WHERE updated_at < NOW() - INTERVAL '30 days' AND is_active = true;
    
    -- Delete tokens that have been inactive for 60 days
    DELETE FROM user_tokens 
    WHERE is_active = false AND updated_at < NOW() - INTERVAL '60 days';
END;
$$;

-- Schedule the notification check to run daily at 9 AM
SELECT cron.schedule(
    'daily-document-reminders',
    '0 9 * * *',
    $$
    SELECT net.http_post(
        url := 'https://rrsggituwyibyxpoocyo.supabase.co/functions/v1/send-document-reminders',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2dnaXR1d3lpYnl4cG9vY3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDM1NzcsImV4cCI6MjA2NjY3OTU3N30.8VKY8GLwgIHVtFGmSASz9IssCCd4lj78M3m9ddL7owc"}'::jsonb,
        body := '{"scheduled": true}'::jsonb
    ) as request_id;
    $$
);

-- Schedule token cleanup to run weekly
SELECT cron.schedule(
    'weekly-token-cleanup',
    '0 2 * * 0',
    $$
    SELECT cleanup_old_tokens();
    $$
);