import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AuthDebug() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getSession = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setError(error.message);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      console.log('Session retrieved:', session);
    } catch (error) {
      console.error('Exception getting session:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRefreshSession = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        setError(error.message);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      console.log('Session refreshed:', session);
    } catch (error) {
      console.error('Exception refreshing session:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        setError(error.message);
      } else {
        console.log('Signed out successfully');
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Exception signing out:', error);
      setError(error.message);
    }
  };

  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    return { accessToken, refreshToken, error, errorDescription };
  };

  const urlParams = checkUrlParams();

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">🔧 Authentication Debug Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Session Status:</h4>
          <p className="text-sm mb-2">
            {loading ? 'Loading...' : (session ? 'Active' : 'No Session')}
          </p>
          {session && (
            <div className="text-xs text-gray-600">
              <p>User ID: {session.user?.id}</p>
              <p>Email: {session.user?.email}</p>
              <p>Created: {new Date(session.user?.created_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* URL Parameters */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">URL Parameters:</h4>
          <div className="text-xs text-gray-600">
            <p>Access Token: {urlParams.accessToken ? 'Present' : 'Missing'}</p>
            <p>Refresh Token: {urlParams.refreshToken ? 'Present' : 'Missing'}</p>
            {urlParams.error && (
              <>
                <p className="text-red-600">Error: {urlParams.error}</p>
                <p className="text-red-600">Description: {urlParams.errorDescription}</p>
              </>
            )}
          </div>
        </div>

        {/* Session Details */}
        {session && (
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <h4 className="font-medium mb-2">Session Info:</h4>
            <div className="text-xs text-gray-600">
              <p><strong>Access Token:</strong> {session.access_token ? 'Present' : 'Missing'}</p>
              <p><strong>Refresh Token:</strong> {session.refresh_token ? 'Present' : 'Missing'}</p>
              <p><strong>Expires At:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
              <p><strong>Token Type:</strong> {session.token_type}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg md:col-span-2">
            <h4 className="font-medium text-red-800 mb-2">Error:</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={getSession}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Get Session
        </button>
        <button
          onClick={handleRefreshSession}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh Session
        </button>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-medium mb-2">Debug Info:</h4>
        <div className="text-xs">
          <p>Current URL: {window.location.href}</p>
          <p>Origin: {window.location.origin}</p>
          <p>Pathname: {window.location.pathname}</p>
          <p>Search: {window.location.search}</p>
          <p>Hash: {window.location.hash}</p>
        </div>
      </div>

      {/* Console Log Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            console.log('Current session:', session);
            console.log('Current user:', user);
            console.log('URL params:', urlParams);
            console.log('Window location:', window.location);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Log to Console
        </button>
      </div>
    </div>
  );
}
