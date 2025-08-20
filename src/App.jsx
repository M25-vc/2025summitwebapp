import { useEffect, useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import AuthDebug from './AuthDebug';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Handle auth callback from magic link
    const handleAuthCallback = async () => {
      console.log('🔧 Starting auth callback handling...');
      console.log('🔧 Current URL:', window.location.href);
      console.log('🔧 URL search params:', window.location.search);
      console.log('🔧 URL hash:', window.location.hash);
      
      // Check for URL parameters that might indicate a magic link callback
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const error = urlParams.get('error');
      
      if (accessToken || refreshToken) {
        console.log('🔧 Found auth tokens in URL, processing...');
        console.log('🔧 Access token present:', !!accessToken);
        console.log('🔧 Refresh token present:', !!refreshToken);
        
        // When tokens are in URL, Supabase will automatically process them
        // We need to wait for the session to be established
        console.log('🔧 Waiting for Supabase to process magic link...');
        
        // Wait for Supabase to process the magic link and establish session
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('🔧 Error getting session during magic link processing:', sessionError);
          }
          
          if (sessionData.session) {
            console.log('🔧 Session established after magic link processing');
            console.log('🔧 User email:', sessionData.session.user?.email);
            setUser(sessionData.session.user);
            setLoading(false);
            
            // Clean up URL parameters after successful authentication
            if (window.history && window.history.replaceState) {
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
              console.log('🔧 Cleaned up URL parameters');
            }
            
            return;
          }
          
          attempts++;
          console.log(`🔧 Attempt ${attempts}: Waiting for session...`);
        }
        
        console.log('🔧 Magic link processing timeout - no session established');
        console.log('🔧 This might indicate an issue with the magic link or Supabase configuration');
      }
      
      if (error) {
        console.error('🔧 Auth error in URL:', error);
      }
      
      // Get the current session after potential magic link processing
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('🔧 Session error:', sessionError);
      }
      
      if (data.session) {
        console.log('🔧 Session found:', data.session);
        setUser(data.session.user);
      } else {
        console.log('🔧 No session found');
      }
      
      setLoading(false);
    };

    // Check initial auth state and handle callback
    handleAuthCallback();

    // Listen for auth state changes - this is crucial for magic link handling
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔧 Auth state changed:', event, session);
      
      // Handle specific auth events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔧 User signed in or token refreshed:', session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('🔧 User signed out');
        setUser(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        console.log('🔧 Initial session established:', session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Add keyboard shortcut to toggle debug panel
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === 'd') {
        setShowDebug(!showDebug);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showDebug]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  
  return (
    <div>
      {showDebug && <AuthDebug />}
      {user ? <Dashboard user={user} /> : <Login />}
      {!showDebug && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-70">
          Press Ctrl+D to toggle debug panel
        </div>
      )}
    </div>
  );
}

export default App;