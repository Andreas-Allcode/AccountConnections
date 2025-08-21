# LinkedIn OAuth Debug Implementation Steps

## Step 1: Add Debug Handler to Your Convex Functions (2 minutes)

1. **Open your `src/convex/linkedin.ts` file**
2. **Add the debug handler** from `/Users/andreas/AccountConnections/your_project_linkedin_debug.ts`
3. **Copy the entire `handleLinkedInCallbackDebug` function** and paste it into your existing `linkedin.ts` file

## Step 2: Update Your Frontend Components (1 minute)

Your components are already set up correctly! I can see:
- `LinkedInCallback.tsx` already uses `handleLinkedInCallbackDebug`
- `LinkedInHandler.tsx` already uses `handleLinkedInCallbackDebug`

**No changes needed to frontend!** ✅

## Step 3: Deploy and Test (2 minutes)

1. **Deploy your changes:**
   ```bash
   # In your project directory
   pnpm convex dev
   ```

2. **Set environment variables** in your Convex dashboard:
   - `LINKEDIN_CLIENT_ID` = Your LinkedIn app's Client ID
   - `LINKEDIN_CLIENT_SECRET` = Your LinkedIn app's Client Secret  
   - `SITE_URL` = `https://accountconnections.vly.site`

3. **Test the OAuth flow:**
   - Run `pnpm dev` to start your app
   - Click "Continue with LinkedIn"
   - Authorize on LinkedIn
   - **Check your Convex dashboard logs** for detailed debug output

## Step 4: Check Debug Output

In your Convex dashboard logs, look for:

### ✅ If It Works:
```
=== TOKEN EXCHANGE RESPONSE ===
Status: 200
Body: {"access_token":"...", "token_type":"Bearer", ...}
✅ SUCCESS! Token exchange worked
```

### ❌ If There's an Error:
```
=== TOKEN EXCHANGE RESPONSE ===
Status: 400
Body: {"error":"invalid_client","error_description":"Invalid client credentials"}
❌ LinkedIn API returned error status: 400
```

## Common Error Fixes:

### `"error":"invalid_client"`
- **Problem:** Wrong Client ID or Client Secret
- **Fix:** Double-check your LinkedIn app credentials in Convex environment variables

### `"error":"invalid_redirect_uri"`
- **Problem:** LinkedIn app settings don't match your redirect URI
- **Fix:** Update LinkedIn app to have `https://accountconnections.vly.site/` (with trailing slash)

### `"error":"invalid_grant"`
- **Problem:** Authorization code expired or already used
- **Fix:** Try the OAuth flow again with a fresh code

## Your Current Setup Analysis:

✅ **Redirect URI:** Your code generates `https://accountconnections.vly.site/` - this should work
✅ **Frontend Components:** Already configured for debug mode
✅ **Environment Variables:** Need to be set in Convex dashboard

## Next Steps:

1. Add the debug handler to your `linkedin.ts` file
2. Deploy with `pnpm convex dev`
3. Test the OAuth flow
4. **Report back the exact error message** from the Convex logs

The debug output will immediately tell us what's wrong and how to fix it!
