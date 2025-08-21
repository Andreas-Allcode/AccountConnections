"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Enhanced debug version of your LinkedIn callback
export const handleLinkedInCallbackDebug = action({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const siteUrl = process.env.SITE_URL;

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
      throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
    }

    const redirectUri = new URL("/", siteUrl).toString();
    
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
        
        throw new Error(`LinkedIn token exchange failed: ${JSON.stringify(errorDetails, null, 2)}`);
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
