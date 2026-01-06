import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://xfvwklnfdiyqhtuhlvpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....'
)
