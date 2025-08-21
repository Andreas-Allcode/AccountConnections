# Complete LinkedIn OAuth Project Setup

## Your Complete Project Structure

I've created your entire project in `/Users/andreas/AccountConnections/vly-app/`

## Quick Setup (5 minutes)

### Step 1: Navigate to Project
```bash
cd /Users/andreas/AccountConnections/vly-app
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Set up Convex
```bash
pnpm convex dev
```

### Step 4: Set Environment Variables
In your Convex dashboard (opens automatically), go to Settings → Environment Variables:
- `LINKEDIN_CLIENT_ID` = Your LinkedIn app's Client ID
- `LINKEDIN_CLIENT_SECRET` = Your LinkedIn app's Client Secret  
- `SITE_URL` = `https://accountconnections.vly.site`

### Step 5: Start Development Server
```bash
pnpm dev
```

## Test LinkedIn OAuth

1. **Open your app** (usually http://localhost:5173)
2. **Click "Continue with LinkedIn"**
3. **Authorize on LinkedIn**
4. **Check Convex logs** for detailed debug output

## What to Look For in Logs

### ✅ Success:
```
=== TOKEN EXCHANGE RESPONSE ===
Status: 200
Body: {"access_token":"...", "token_type":"Bearer"}
✅ SUCCESS! Token exchange worked
```

### ❌ Common Errors:

**Invalid Client:**
```
Status: 400
Body: {"error":"invalid_client","error_description":"Invalid client credentials"}
```
**Fix:** Check your Client ID/Secret in Convex environment variables

**Invalid Redirect URI:**
```
Status: 400  
Body: {"error":"invalid_redirect_uri"}
```
**Fix:** Update LinkedIn app to have `https://accountconnections.vly.site/`

**Invalid Grant:**
```
Status: 400
Body: {"error":"invalid_grant"}
```
**Fix:** Authorization code expired - try OAuth flow again

## Project Features

✅ **Complete LinkedIn OAuth implementation**
✅ **Debug logging for troubleshooting**
✅ **React Router setup**
✅ **Tailwind CSS styling**
✅ **Convex backend integration**
✅ **Error handling and user feedback**

## Files Created

- `package.json` - Project dependencies
- `src/main.tsx` - App entry point with routing
- `src/index.css` - Tailwind CSS styles
- `src/convex/linkedin.ts` - LinkedIn OAuth handlers (with debug)
- `src/pages/LinkedInCallback.tsx` - OAuth callback page
- `src/components/auth/LinkedInAuthButton.tsx` - LinkedIn login button
- `src/components/auth/LinkedInHandler.tsx` - Background OAuth handler

## Next Steps

1. Run the setup commands above
2. Test the LinkedIn OAuth flow
3. **Report back the exact error** from Convex logs
4. We'll fix the specific issue based on the debug output

The debug handler will show us exactly what LinkedIn is returning, making it easy to identify and fix the problem!
