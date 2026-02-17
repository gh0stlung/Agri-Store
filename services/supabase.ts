import { createClient } from '@supabase/supabase-js';

// NOTE: The anon key provided must be a valid Supabase JWT (starts with ey...). 
// If auth fails with 400/401, check that this key is correct in your project settings.
const SUPABASE_URL = 'https://obspafaiznaqsgaxuhcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_x6PguQgSSoWqmOo96dJi7Q_ajwPsIRE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});