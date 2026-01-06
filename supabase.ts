import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xfvwklnfdiyqhtuhlvpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdndrbG5mZGl5cWh0dWhsdnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODMxNTIsImV4cCI6MjA4MzI1OTE1Mn0.0gaHgnvZNZATcfwggiujCAe-VROFeqvJFkXfJAbpUnU'
)
