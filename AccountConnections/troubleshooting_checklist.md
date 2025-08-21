# LinkedIn OAuth Troubleshooting Checklist

Work through these steps systematically to identify and fix your LinkedIn OAuth issue.

## Step 1: Verify Redirect URI Configuration ⭐ START HERE

### Check Your Code's Redirect URI
1. Run the debug script:
   ```bash
   cd /Users/andreas/AccountConnections
   node debug_linkedin.js
   ```
2. Note the exact output (e.g., `https://yourapp.com/`)

### Check LinkedIn Developer App Settings
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Navigate to your app → Auth tab
3. Look at "Authorized redirect URLs"
4. **CRITICAL:** The URL must match EXACTLY (including trailing slash)

### Common Mismatches:
- Code generates: `https://yourapp.com/`
- LinkedIn has: `https://yourapp.com` ❌
- **Fix:** Add the trailing slash in LinkedIn settings

## Step 2: Verify Environment Variables

### Check if variables are loaded:
1. Add the debug handler to your Convex functions
2. Trigger the OAuth flow
3. Check Convex logs for environment variable debug output

### Common Issues:
- `LINKEDIN_CLIENT_SECRET` has extra spaces
- Variables not set in production environment
- Copy/paste errors with special characters

### Verification:
- Client ID should be ~14 characters
- Client Secret should be ~40+ characters
- SITE_URL should match your domain exactly

## Step 3: LinkedIn App Configuration

### App Status
- [ ] App is in "Live" mode (not Development)
- [ ] App has been reviewed and approved by LinkedIn (if required)

### Permissions/Scopes
- [ ] App has `openid` permission
- [ ] App has `profile` permission  
- [ ] App has `email` permission
- [ ] Scopes in your code match app permissions

### Products
- [ ] "Sign In with LinkedIn using OpenID Connect" is enabled
- [ ] No conflicting products are enabled

## Step 4: Test with Debug Handler

### Implementation:
1. Copy `linkedin_debug.ts` content to your Convex functions
2. Temporarily replace `api.linkedin.handleLinkedInCallback` with `api.linkedin.handleLinkedInCallbackDebug`
3. Trigger the OAuth flow
4. Check Convex logs for detailed error information

### What to Look For:
- HTTP status codes (400, 401, 403, etc.)
- Specific error messages from LinkedIn
- Request/response details

## Step 5: Common Error Codes

### HTTP 400 - Bad Request
- **Cause:** Invalid request parameters
- **Check:** Redirect URI mismatch, invalid authorization code
- **Fix:** Verify redirect URI matches exactly

### HTTP 401 - Unauthorized  
- **Cause:** Invalid client credentials
- **Check:** Client ID or Client Secret is wrong
- **Fix:** Regenerate credentials in LinkedIn app

### HTTP 403 - Forbidden
- **Cause:** App doesn't have required permissions
- **Check:** App permissions and status
- **Fix:** Enable required permissions in LinkedIn app

## Step 6: Advanced Debugging

### Network Issues:
- Try the OAuth flow multiple times
- Check if it works intermittently
- Verify your server can reach LinkedIn's API

### Timing Issues:
- Authorization codes expire quickly (10 minutes)
- Don't reuse authorization codes
- Ensure user completes flow promptly

## Step 7: Verification Steps

Once you think you've fixed the issue:

1. **Clear browser cache/cookies**
2. **Test the complete flow:**
   - Click "Continue with LinkedIn"
   - Authorize on LinkedIn
   - Verify successful redirect and user creation
3. **Test with different browsers/devices**
4. **Check production vs development environments**

## Getting Help

If you're still stuck:
1. Run the debug handler and collect the logs
2. Note the exact error message and HTTP status code
3. Verify your LinkedIn app configuration screenshots
4. Check if the issue is consistent or intermittent

The debug logs will provide the specific information needed to identify the root cause.
