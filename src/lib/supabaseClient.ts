import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rrsggituwyibyxpoocyo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2dnaXR1d3lpYnl4cG9vY3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDQxODUsImV4cCI6MjA2NzgyMDE4NX0.AqSR8b6kkazbJnZRQy-TBgyiyPF36OmToPGzbyy67ck'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
