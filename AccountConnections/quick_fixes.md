# Quick Fixes for LinkedIn OAuth Issues

## Fix #1: Redirect URI Mismatch (Most Common)

### Problem
Your code generates `https://yourapp.com/` but LinkedIn expects `https://yourapp.com`

### Solution A: Update LinkedIn Settings
1. Go to LinkedIn Developer Portal
2. Navigate to your app → Auth tab  
3. Update "Authorized redirect URLs" to include the trailing slash: `https://yourapp.com/`

### Solution B: Update Your Code
Change this line in your `linkedin.ts`:
```typescript
// Current (generates trailing slash)
const redirectUri = new URL("/", siteUrl).toString();

// Alternative (no trailing slash)  
const redirectUri = siteUrl;
```

## Fix #2: Environment Variables

### Check Variables Are Set
Add this temporary debug to your Convex function:
```typescript
console.log("CLIENT_ID:", process.env.LINKEDIN_CLIENT_ID?.substring(0, 5) + "...");
console.log("CLIENT_SECRET:", process.env.LINKEDIN_CLIENT_SECRET?.substring(0, 5) + "...");
console.log("SITE_URL:", process.env.SITE_URL);
```

### Common Issues:
- Extra spaces: `"your_secret "` ❌ vs `"your_secret"` ✅
- Missing variables in production environment
- Wrong variable names

## Fix #3: LinkedIn App Configuration

### Enable Required Products
1. Go to LinkedIn Developer Portal
2. Navigate to your app → Products tab
3. Ensure "Sign In with LinkedIn using OpenID Connect" is enabled and approved

### Check App Status
- Development apps only work with your LinkedIn account
- For production, app must be approved and in "Live" mode

## Fix #4: Authorization Code Issues

### Problem: "Invalid authorization code"
- Authorization codes expire in 10 minutes
- Codes can only be used once
- Don't refresh the callback page

### Solution:
- Complete the OAuth flow quickly
- Don't reuse authorization codes
- Clear browser cache if testing repeatedly

## Fix #5: Scope/Permission Issues

### Ensure Correct Scopes
Your code requests: `"openid profile email"`

LinkedIn app must have these permissions enabled:
- ✅ OpenID Connect
- ✅ Profile  
- ✅ Email Address

## Emergency Debug Steps

If nothing else works:

1. **Test with a fresh LinkedIn app:**
   - Create a new LinkedIn Developer app
   - Use new Client ID/Secret
   - This isolates configuration issues

2. **Test the LinkedIn API directly:**
   ```bash
   # Test token exchange manually (replace values)
   curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=YOUR_REDIRECT&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
   ```

3. **Check LinkedIn API Status:**
   - Visit LinkedIn Developer Status page
   - Verify no ongoing API issues

## Success Indicators

You'll know it's working when:
- ✅ No "Server Error" message
- ✅ User is redirected to your dashboard
- ✅ User data is saved to your database
- ✅ Success toast message appears
