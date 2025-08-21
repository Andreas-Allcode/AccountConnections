// ADD THIS TO YOUR EXISTING src/convex/linkedin.ts FILE

"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";

// ADD THIS NEW DEBUG HANDLER TO YOUR EXISTING linkedin.ts FILE
export const handleLinkedInCallbackDebug = action({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("🚀 Starting LinkedIn OAuth debug handler");
    
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const siteUrl = process.env.SITE_URL;

    // Enhanced environment variable debugging
    console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
    console.log("LINKEDIN_CLIENT_ID exists:", !!clientId);
    console.log("LINKEDIN_CLIENT_ID length:", clientId?.length || 0);
    console.log("LINKEDIN_CLIENT_ID value:", clientId ? clientId.substring(0, 8) + "..." : "MISSING");
    console.log("LINKEDIN_CLIENT_SECRET exists:", !!clientSecret);
    console.log("LINKEDIN_CLIENT_SECRET length:", clientSecret?.length || 0);
    console.log("LINKEDIN_CLIENT_SECRET value:", clientSecret ? clientSecret.substring(0, 8) + "..." : "MISSING");
    console.log("SITE_URL:", siteUrl);
    
    if (!clientId || !clientSecret || !siteUrl) {
      let missingVars = [];
      if (!clientId) missingVars.push("LINKEDIN_CLIENT_ID");
      if (!clientSecret) missingVars.push("LINKEDIN_CLIENT_SECRET");
      if (!siteUrl) missingVars.push("SITE_URL");
      const errorMsg = `Missing environment variables: ${missingVars.join(", ")}`;
      console.error("❌ " + errorMsg);
      throw new Error(errorMsg);
    }

    const redirectUri = new URL("/", siteUrl).toString();
    
    console.log("=== REQUEST PARAMETERS DEBUG ===");
    console.log("Authorization code:", args.code ? args.code.substring(0, 20) + "..." : "MISSING");
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

      console.log("🔄 Making request to LinkedIn...");
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
        console.error("❌ LinkedIn API returned error status:", tokenResponse.status);
        
        // Enhanced error parsing
        let errorDetails = {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          body: responseBodyText
        };
        
        try {
          const errorJson = JSON.parse(responseBodyText);
          errorDetails = { ...errorDetails, ...errorJson };
          console.error("❌ Parsed error details:", errorJson);
        } catch (e) {
          console.error("❌ Could not parse error response as JSON");
        }
        
        throw new Error(`LinkedIn token exchange failed: ${JSON.stringify(errorDetails, null, 2)}`);
      }

      const tokenData = JSON.parse(responseBodyText);
      console.log("✅ SUCCESS! Token exchange worked");
      console.log("Token data keys:", Object.keys(tokenData));
      console.log("Access token received:", !!tokenData.access_token);
      
      return { 
        success: true, 
        debug: {
          redirectUri,
          clientIdLength: clientId.length,
          secretLength: clientSecret.length,
          responseStatus: tokenResponse.status,
          tokenReceived: !!tokenData.access_token
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
