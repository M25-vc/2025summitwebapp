import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tmsswjjgpwmkakillimx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc3N3ampncHdta2FraWxsaW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3Njg4OTAsImV4cCI6MjA2ODM0NDg5MH0.5sdUo6FcjYFPwrVfa4q8YvWa2fWjjAMtZKFZoNX2djQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Debug logging for production
if (import.meta.env.PROD) {
  console.log('🔧 Supabase configured for production');
  console.log('🔧 Supabase URL:', supabaseUrl);
}