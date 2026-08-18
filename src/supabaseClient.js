import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moiybjysoshxhgilakca.supabase.co';
const supabaseAnonKey = 'sb_publishable_ZeAvABjreJ89Ek8c2mR6LQ_tlh3NZBt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

