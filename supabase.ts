import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xfvwklnfdiyqhtuhlvpi.supabase.co'

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdndrbG5mZGl5cWh0dWhsdnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODMxNTIsImV4cCI6MjA4MzI1OTE1Mn0.0gaHgnvZNZATcfwggiujCAe-VROFeqvJFkXfJAbpUnU'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
