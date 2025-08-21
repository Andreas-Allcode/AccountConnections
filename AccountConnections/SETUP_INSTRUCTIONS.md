# LinkedIn OAuth Test Setup

## Quick Setup (5 minutes)

### Step 1: Deploy to Convex
```bash
cd /Users/andreas/AccountConnections/linkedin-oauth-test
npx convex login
npx convex dev
```

### Step 2: Set Environment Variables
In your Convex dashboard (opens automatically), go to Settings → Environment Variables and add:

- `LINKEDIN_CLIENT_ID` = Your LinkedIn app's Client ID
- `LINKEDIN_CLIENT_SECRET` = Your LinkedIn app's Client Secret  
- `SITE_URL` = `https://accountconnections.vly.site`

### Step 3: Start the Development Server
```bash
npm run dev
```

### Step 4: Test the OAuth Flow
1. Open the app in your browser (usually http://localhost:5173)
2. Click "Continue with LinkedIn"
3. Authorize the app on LinkedIn
4. Check the console and page for detailed debug information

## What You'll See

### If It Works:
- ✅ Success message with debug information
- Token exchange details in the console
- No errors

### If There's an Issue:
- ❌ Detailed error message showing exactly what LinkedIn returned
- HTTP status codes (400, 401, etc.)
- Specific error descriptions ("invalid_client", "invalid_redirect_uri", etc.)

## Common Issues and Fixes

### "invalid_redirect_uri"
- **Fix:** Update your LinkedIn app settings to include `https://accountconnections.vly.site/`

### "invalid_client" 
- **Fix:** Double-check your Client ID and Client Secret in Convex environment variables

### "invalid_grant"
- **Fix:** Authorization code expired - try the flow again

## Debug Information

The debug handler will show you:
- Environment variables status
- Request parameters sent to LinkedIn
- Full LinkedIn API response
- Exact error messages

This will immediately tell us what's wrong with your LinkedIn OAuth setup!

## Files Created

- `convex/linkedin.ts` - LinkedIn OAuth handlers with debug logging
- `src/LinkedInTest.tsx` - Simple test interface
- `src/App.tsx` - Updated to use the LinkedIn test

## Next Steps

Once you get this working, you can copy the working configuration back to your main project.
