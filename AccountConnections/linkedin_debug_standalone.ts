// Standalone LinkedIn OAuth Debug Script
// This version works without Convex dependencies

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
}

interface LinkedInProfile {
  sub: string;
  name: string;
  email?: string;
  picture?: string;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 500
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      console.warn(`Attempt ${i + 1} failed with status ${response.status}. Retrying in ${backoff}ms...`);
    } catch (error: any) {
      console.warn(`Attempt ${i + 1} failed with error: ${error.message}. Retrying in ${backoff}ms...`);
    }
    await new Promise(res => setTimeout(res, backoff));
    backoff *= 2;
  }
  return await fetch(url, options);
}

export function getAuthorizationUrl(): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const siteUrl = process.env.SITE_URL;
  
  if (!clientId || !siteUrl) {
    throw new Error("LINKEDIN_CLIENT_ID or SITE_URL is not set in environment variables.");
  }
  
  const redirectUri = new URL("/", siteUrl).toString();
  const scope = "openid profile email";
  const state = "DCEeFWf45A53sdfKef424";
  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", scope);
  
  return authUrl.toString();
}

export async function handleLinkedInCallbackDebug(code: string): Promise<any> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const siteUrl = process.env.SITE_URL;

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
  console.log("Authorization code:", code);
  console.log("Redirect URI:", redirectUri);
  console.log("Client ID:", clientId);
  console.log("Client Secret (first 10 chars):", clientSecret.substring(0, 10) + "...");

  try {
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
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

    const tokenData: LinkedInTokenResponse = JSON.parse(responseBodyText);
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
}

export async function handleLinkedInCallback(code: string): Promise<any> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const siteUrl = process.env.SITE_URL;
  
  if (!clientId || !clientSecret || !siteUrl) {
    let missingVars = [];
    if (!clientId) missingVars.push("LINKEDIN_CLIENT_ID");
    if (!clientSecret) missingVars.push("LINKEDIN_CLIENT_SECRET");
    if (!siteUrl) missingVars.push("SITE_URL");
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }

  const redirectUri = new URL("/", siteUrl).toString();
  let accessToken: string;

  try {
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString();

    const tokenResponse = await fetchWithRetry(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: requestBody,
    });

    const responseBodyText = await tokenResponse.text();
    
    if (!tokenResponse.ok) {
      let errorMessage = "Unknown error during token exchange.";
      try {
        const errorJson = JSON.parse(responseBodyText);
        errorMessage = errorJson.error_description || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = responseBodyText;
      }
      throw new Error(`Failed to get access token: ${errorMessage}`);
    }

    const tokenData: LinkedInTokenResponse = JSON.parse(responseBodyText);
    if (!tokenData.access_token) {
      throw new Error("Access token not found in LinkedIn response.");
    }
    accessToken = tokenData.access_token;

  } catch (error: any) {
    throw new Error(`Error during token exchange: ${error.message}`);
  }

  try {
    const profileUrl = "https://api.linkedin.com/v2/userinfo";
    const profileResponse = await fetchWithRetry(profileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profileBodyText = await profileResponse.text();
    
    if (!profileResponse.ok) {
      let errorMessage = "Unknown error during profile fetch.";
      try {
        const errorJson = JSON.parse(profileBodyText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = profileBodyText;
      }
      throw new Error(`Failed to get profile: ${errorMessage}`);
    }

    const profileData: LinkedInProfile = JSON.parse(profileBodyText);
    
    if (!profileData.sub || !profileData.name) {
      throw new Error("LinkedIn profile data is missing required fields (sub, name).");
    }

    return { success: true, profile: profileData };

  } catch (error: any) {
    throw new Error(`Error during profile fetch: ${error.message}`);
  }
}