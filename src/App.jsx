import { useEffect, useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle auth callback from magic link
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
      }
      
      if (data.session) {
        setUser(data.session.user);
      }
      
      setLoading(false);
    };

    // Check initial auth state and handle callback
    handleAuthCallback();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? <Dashboard user={user} /> : <Login />;
}

export default App;