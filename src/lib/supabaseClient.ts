import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rrsggituwyibyxpoocyo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2dnaXR1d3lpYnl4cG9vY3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDM1NzcsImV4cCI6MjA2NjY3OTU3N30.8VKY8GLwgIHVtFGmSASz9IssCCd4lj78M3m9ddL7owc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)