import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://xfvwklnfdiyqhtuhlvpi.supabase.co',
  'PASTE_YOUR_ANON_KEY_HERE'
);
