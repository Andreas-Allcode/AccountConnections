# LinkedIn OAuth Integration Troubleshooting

This folder contains debugging tools and documentation for your LinkedIn OAuth integration.

## Current Issue
You're experiencing a "Server Error" during Stage 2 of the OAuth flow - specifically when your server tries to exchange the authorization code for an access token.

## Files in this folder

### 1. `debug_linkedin.js`
A simple script to verify your redirect URI construction matches your LinkedIn app settings.

**Usage:**
1. Edit the file and replace `YOUR_SITE_URL_HERE` with your actual SITE_URL
2. Run: `node debug_linkedin.js`
3. Compare the output with your LinkedIn Developer App settings

### 2. `linkedin_debug.ts`
An enhanced version of your LinkedIn callback handler with extensive logging.

**Usage:**
1. Add this to your Convex functions
2. Temporarily replace your `handleLinkedInCallback` calls with `handleLinkedInCallbackDebug`
3. Check the Convex logs for detailed error information

### 3. `troubleshooting_checklist.md`
A step-by-step checklist to systematically identify the issue.

## Most Common Issues (in order of likelihood)

### 1. Redirect URI Mismatch ⭐ MOST LIKELY
- Your code generates: `https://yourapp.com/`
- LinkedIn expects: `https://yourapp.com` (no trailing slash)
- **Fix:** Update your LinkedIn app settings to match exactly

### 2. Environment Variables
- Missing or incorrect `LINKEDIN_CLIENT_SECRET`
- Extra spaces/newlines in environment variables
- **Fix:** Verify all environment variables are set correctly

### 3. LinkedIn App Configuration
- App not in "Live" mode
- Incorrect permissions/scopes
- **Fix:** Check your LinkedIn Developer App settings

### 4. Network/Timing Issues
- Temporary LinkedIn API issues
- Request timeout
- **Fix:** Retry the authentication flow

## Next Steps

1. Run `debug_linkedin.js` to check your redirect URI
2. Use `linkedin_debug.ts` to get detailed error logs
3. Follow the troubleshooting checklist
4. Check your LinkedIn Developer App settings

## Need Help?
If you're still stuck after trying these steps, the debug logs from `linkedin_debug.ts` will provide the specific error details needed to identify the issue.
