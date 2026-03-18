import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://obspafaiznaqsgaxuhcf.supabase.co";
const supabaseAnonKey = "sb_publishable_x6PguQgSSoWqmOo96dJi7Q_ajwPsIRE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
