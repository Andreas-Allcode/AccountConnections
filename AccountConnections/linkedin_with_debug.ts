"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";

async function fetchWithRetry(
url: string,
options: RequestInit,
retries = 3,
backoff = 500
): Promise<Response> {
for (let i = 0; i < retries; i++) {
try {
const response = await fetch(url, options);
// Success or client error which shouldn't be retried
if (response.ok || (response.status >= 400 && response.status < 500)) {
return response;
}
console.warn(`Attempt ${i + 1} to fetch ${url} failed with status ${response.status}. Retrying in ${backoff}ms...`);
} catch (error: any) {
console.warn(`Attempt ${i + 1} to fetch ${url} failed with error: ${error.message}. Retrying in ${backoff}ms...`);
}
await new Promise(res => setTimeout(res, backoff));
backoff *= 2; // Exponential backoff
}
// Last attempt, if it fails, the error will be thrown from here
console.log(`Final attempt to fetch ${url}...`);
return await fetch(url, options);
}

export const getAuthorizationUrl = action({
args: {},
handler: async (ctx) => {
const clientId = process.env.LINKEDIN_CLIENT_ID!;
const siteUrl = process.env.SITE_URL!;
if (!clientId || !siteUrl) {
throw new ConvexError(
"LINKEDIN_CLIENT_ID or SITE_URL is not set in backend environment variables."
);
}
const redirectUri = new URL("/linkedin-callback", siteUrl).toString();
const scope = "openid profile email";
const state = "DCEeFWf45A53sdfKef424";
const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("scope", scope);
return authUrl.toString();
},
});

// DEBUG VERSION - Use this temporarily to diagnose the issue
export const handleLinkedInCallbackDebug = action({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    const siteUrl = process.env.SITE_URL!;

    // Enhanced environment variable debugging
    console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
    console.log("LINKEDIN_CLIENT_ID exists:", !!clientId);
    console.log("LINKEDIN_CLIENT_ID length:", clientId?.length || 0);
    console.log("LINKEDIN_CLIENT_SECRET exists:", !!clientSecret);
    console.log("LINKEDIN_CLIENT_SECRET length:", clientSecret?.length || 0);
    console.log("SITE_URL:", siteUrl);
    
    if (!clientId || !clientSecret || !siteUrl) {
      let missingVars = [];
      if (!clientId) missingVars.push("LINKEDIN_CLIENT_ID");
      if (!clientSecret) missingVars.push("LINKEDIN_CLIENT_SECRET");
      if (!siteUrl) missingVars.push("SITE_URL");
      throw new ConvexError(`Missing environment variables: ${missingVars.join(", ")}`);
    }

    const redirectUri = new URL("/linkedin-callback", siteUrl).toString();
    
    console.log("=== REQUEST PARAMETERS DEBUG ===");
    console.log("Authorization code:", args.code);
    console.log("Redirect URI:", redirectUri);
    console.log("Client ID:", clientId);
    console.log("Client Secret (first 10 chars):", clientSecret.substring(0, 10) + "...");

    // Step 1: Exchange authorization code for access token
    try {
      const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
      const requestBody = new URLSearchParams({
        grant_type: "authorization_code",
        code: args.code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString();

      console.log("=== TOKEN EXCHANGE REQUEST ===");
      console.log("URL:", tokenUrl);
      console.log("Request body:", requestBody);

      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: requestBody,
      });

      const responseBodyText = await tokenResponse.text();
      
      console.log("=== TOKEN EXCHANGE RESPONSE ===");
      console.log("Status:", tokenResponse.status);
      console.log("Status Text:", tokenResponse.statusText);
      console.log("Headers:", Object.fromEntries(tokenResponse.headers.entries()));
      console.log("Body:", responseBodyText);

      if (!tokenResponse.ok) {
        // Enhanced error parsing
        let errorDetails = {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          body: responseBodyText
        };
        
        try {
          const errorJson = JSON.parse(responseBodyText);
          errorDetails = { ...errorDetails, ...errorJson };
        } catch (e) {
          // Response is not JSON
        }
        
        throw new ConvexError(`LinkedIn token exchange failed: ${JSON.stringify(errorDetails, null, 2)}`);
      }

      const tokenData = JSON.parse(responseBodyText);
      console.log("=== SUCCESS ===");
      console.log("Token data keys:", Object.keys(tokenData));
      
      return { 
        success: true, 
        debug: {
          redirectUri,
          clientIdLength: clientId.length,
          secretLength: clientSecret.length,
          responseStatus: tokenResponse.status
        }
      };

    } catch (error: any) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  },
});

// ORIGINAL VERSION - Your existing handler
export const handleLinkedInCallback = action({
args: {
code: v.string(),
},
handler: async (ctx, args) => {
const clientId = process.env.LINKEDIN_CLIENT_ID!;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
const siteUrl = process.env.SITE_URL!;
// Extreme debugging: Check if env vars are loaded at all.
if (!clientId || !clientSecret || !siteUrl) {
let missingVars = [];
if (!clientId) missingVars.push("LINKEDIN_CLIENT_ID");
if (!clientSecret) missingVars.push("LINKEDIN_CLIENT_SECRET");
if (!siteUrl) missingVars.push("SITE_URL");
throw new ConvexError(`The following environment variables are missing: ${missingVars.join(", ")}`);
}
// If we get past the check, the variables are loaded.
// The problem is likely in the fetch call or the subsequent logic.
// Let's re-introduce the logic with the most robust logging possible.
const redirectUri = new URL("/linkedin-callback", siteUrl).toString();
// Step 1: Exchange authorization code for access token
let accessToken;
try {
const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
const requestBody = new URLSearchParams({
grant_type: "authorization_code",
code: args.code,
redirect_uri: redirectUri,
client_id: clientId,
client_secret: clientSecret,
}).toString();
console.log("Requesting access token from:", tokenUrl);
console.log("Request body:", requestBody);
const tokenResponse = await fetchWithRetry(tokenUrl, {
method: "POST",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: requestBody,
});
const responseBodyText = await tokenResponse.text();
console.log("Access token response status:", tokenResponse.status);
console.log("Access token response body:", responseBodyText);
if (!tokenResponse.ok) {
let errorMessage = "Unknown error during token exchange.";
try {
const errorJson = JSON.parse(responseBodyText);
errorMessage =
errorJson.error_description || errorJson.error || errorMessage;
} catch (e) {
errorMessage = responseBodyText;
}
throw new ConvexError(`Failed to get access token: ${errorMessage}`);
}
const tokenData = JSON.parse(responseBodyText);
if (!tokenData.access_token) {
throw new ConvexError("Access token not found in LinkedIn response.");
}
accessToken = tokenData.access_token;
console.log("Successfully obtained access token.");
} catch (error: any) {
console.error("Error in token exchange block:", error.message);
throw new ConvexError(`Error during token exchange: ${error.message}`);
}
// Step 2: Use access token to get user profile
try {
const profileUrl = "https://api.linkedin.com/v2/userinfo";
console.log("Fetching profile from:", profileUrl);
const profileResponse = await fetchWithRetry(profileUrl, {
headers: { Authorization: `Bearer ${accessToken}` },
});
const profileBodyText = await profileResponse.text();
console.log("Profile response status:", profileResponse.status);
console.log("Profile response body:", profileBodyText);
if (!profileResponse.ok) {
let errorMessage = "Unknown error during profile fetch.";
try {
const errorJson = JSON.parse(profileBodyText);
errorMessage = errorJson.message || errorMessage;
} catch (e) {
errorMessage = profileBodyText;
}
throw new ConvexError(`Failed to get profile: ${errorMessage}`);
}
const profileData = JSON.parse(profileBodyText);
console.log("Successfully fetched profile data:", JSON.stringify(profileData));
if (!profileData.sub || !profileData.name) {
throw new ConvexError("LinkedIn profile data is missing required fields (sub, name).");
}
console.log("Running mutation to update user.");
await ctx.runMutation(internal.users.updateUserFromLinkedIn, {
linkedinId: profileData.sub,
email: profileData.email,
name: profileData.name,
picture: profileData.picture,
});
console.log("Mutation completed successfully.");
return { success: true };
} catch (error: any) {
console.error("Error in profile fetch/mutation block:", error.message);
throw new ConvexError(`Error during profile fetch or database update: ${error.message}`);
}
},
});
