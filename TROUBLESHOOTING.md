# Magic Link Authentication Troubleshooting Guide

## Issue Description
When using magic link to login, users are redirected back to the login page instead of accessing the webapp.

## Common Causes and Solutions

### 1. Supabase Project Configuration Issues

#### Check Site URL Configuration
- Go to your Supabase project dashboard
- Navigate to Authentication > URL Configuration
- Ensure the Site URL matches your application's domain exactly
- For local development: `http://localhost:5173` (or your Vite dev server port)
- For production: Your actual domain (e.g., `https://yourdomain.com`)

#### Check Redirect URLs
- In Authentication > URL Configuration
- Add these redirect URLs:
  - `http://localhost:5173/**` (for local development)
  - `https://yourdomain.com/**` (for production)
  - `http://localhost:5173` (exact match for local)
  - `https://yourdomain.com` (exact match for production)

### 2. Magic Link Settings

#### Enable Magic Link Authentication
- Go to Authentication > Providers
- Ensure "Email" provider is enabled
- Check that "Enable magic links" is turned on
- Verify "Confirm email" is configured as needed

#### Email Template Configuration
- Check Authentication > Email Templates
- Ensure magic link email template is properly configured
- Verify the redirect URL in the email template

### 3. Environment Variables

#### Check .env File
Create a `.env.local` file in your project root:
```env
VITE_SUPABASE_URL=https://tmsswjjgpwmkakillimx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Verify Environment Variables
- Ensure variables are prefixed with `VITE_`
- Restart your development server after adding environment variables
- Check that variables are being loaded correctly

### 4. Code Issues

#### Supabase Client Configuration
Ensure your supabaseClient.js has:
```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
```

#### Magic Link Callback Handling
Ensure your App.jsx properly handles the callback:
```javascript
useEffect(() => {
  const handleAuthCallback = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (data.session) {
      setUser(data.session.user);
    }
    setLoading(false);
  };
  
  handleAuthCallback();
}, []);
```

### 5. Browser and Network Issues

#### Clear Browser Data
- Clear localStorage and sessionStorage
- Clear cookies for your domain
- Try in an incognito/private window

#### Check Network Tab
- Open browser DevTools
- Go to Network tab
- Try the magic link flow
- Look for failed requests or errors

### 6. Debugging Steps

#### Enable Debug Mode
The app now includes a debug panel:
- Press `Ctrl+D` to toggle the debug panel
- Check session status, URL parameters, and errors
- Use the console logging to track authentication flow

#### Check Console Logs
Look for these log messages:
- `🔧 Starting auth callback handling...`
- `🔧 Found auth tokens in URL, processing...`
- `🔧 Session found:` or `🔧 No session found`
- Any error messages

### 7. Testing the Fix

#### Test Magic Link Flow
1. Request a magic link
2. Check your email for the link
3. Click the link
4. Watch the console for debug messages
5. Check if you're redirected to the dashboard

#### Verify Session Persistence
- After successful login, refresh the page
- Check if you remain logged in
- Verify localStorage contains auth tokens

### 8. Common Error Messages

#### "Invalid redirect URL"
- Check your Supabase site URL and redirect URL configuration
- Ensure URLs match exactly (including protocol and port)

#### "Email not confirmed"
- Check if email confirmation is required
- Verify email template configuration

#### "Invalid magic link"
- Check if the link has expired
- Verify the link wasn't tampered with
- Ensure proper URL encoding

### 9. Production Deployment

#### Domain Configuration
- Update Supabase site URL to your production domain
- Add production redirect URLs
- Ensure HTTPS is properly configured

#### Environment Variables
- Set production environment variables
- Verify they're accessible in your deployment environment

## Still Having Issues?

If the problem persists:
1. Check the browser console for specific error messages
2. Use the debug panel (Ctrl+D) to inspect authentication state
3. Verify Supabase project settings match your configuration
4. Test with a fresh browser session
5. Check Supabase project logs for authentication errors

## Quick Fix Checklist

- [ ] Verify Supabase site URL matches your domain
- [ ] Add correct redirect URLs in Supabase
- [ ] Enable magic link authentication
- [ ] Check environment variables
- [ ] Clear browser data
- [ ] Test in incognito mode
- [ ] Check console for errors
- [ ] Use debug panel to inspect state

