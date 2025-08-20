import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tmsswjjgpwmkakillimx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc3N3ampncHdta2FraWxsaW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3Njg4OTAsImV4cCI6MjA2ODM0NDg5MH0.5sdUo6FcjYFPwrVfa4q8YvWa2fWjjAMtZKFZoNX2djQ';

console.log('🔧 Supabase Client Configuration:');
console.log('🔧 URL:', supabaseUrl);
console.log('🔧 Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🔧 Origin:', window.location.origin);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  }
});

// Debug logging for production
if (import.meta.env.PROD) {
  console.log('🔧 Supabase configured for production');
  console.log('🔧 Supabase URL:', supabaseUrl);
}

// Test the connection and session detection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('🔧 Error testing Supabase connection:', error);
  } else {
    console.log('🔧 Supabase connection test successful');
    console.log('🔧 Current session:', data.session ? 'Present' : 'None');
    if (data.session) {
      console.log('🔧 User email:', data.session.user?.email);
    }
  }
});

// Test URL parameter detection
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('access_token') || urlParams.get('refresh_token')) {
  console.log('🔧 Auth tokens detected in URL - Supabase should process these automatically');
}