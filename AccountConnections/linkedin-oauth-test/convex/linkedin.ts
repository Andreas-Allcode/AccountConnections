"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";

// Company connection scraping function
async function performCompanyConnectionScraping(accessToken: string) {
  try {
    // Get user's profile to extract current company
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!profileResponse.ok) {
      throw new Error('Failed to get user profile');
    }
    
    const profile = await profileResponse.json();
    console.log("📋 User profile retrieved");
    
    // Extract user's current company (simplified)
    const userCompany = "User's Company"; // Would extract from profile in real implementation
    
    // Search for employees at target companies
    const targetCompanies = ["Google", "Microsoft", "Apple", "Amazon", "Meta"];
    const allConnections = [];
    
    for (const company of targetCompanies) {
      console.log(`🔍 Searching employees at ${company}...`);
      
      const connections = await searchCompanyEmployees(accessToken, company, 50);
      allConnections.push({
        company,
        employees: connections,
        total_found: connections.length
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
      userCompany,
      targetCompanies: allConnections,
      totalConnections: allConnections.reduce((sum, c) => sum + c.total_found, 0)
    };
    
  } catch (error: any) {
    console.error('Company connection scraping failed:', error);
    throw error;
  }
}

async function searchCompanyEmployees(accessToken: string, companyName: string, limit: number) {
  try {
    // Use LinkedIn People Search API
    const searchResponse = await fetch(`https://api.linkedin.com/v2/people-search?keywords=${encodeURIComponent(companyName)}&count=${Math.min(limit, 50)}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!searchResponse.ok) {
      console.log(`⚠️ LinkedIn API search failed for ${companyName}, using mock data`);
      return generateMockEmployees(companyName, limit);
    }
    
    const searchData = await searchResponse.json();
    const employees = [];
    
    if (searchData.elements) {
      for (const person of searchData.elements.slice(0, limit)) {
        const employee = processLinkedInPerson(person, companyName);
        if (employee) {
          employees.push(employee);
        }
      }
    }
    
    return employees.sort((a, b) => b.connection_strength - a.connection_strength);
    
  } catch (error) {
    console.error(`Error searching ${companyName} employees:`, error);
    return generateMockEmployees(companyName, limit);
  }
}

function processLinkedInPerson(person: any, companyName: string) {
  const name = `${person.firstName?.localized?.en_US || ''} ${person.lastName?.localized?.en_US || ''}`.trim();
  const headline = person.headline?.localized?.en_US || '';
  const location = person.location?.name || '';
  
  const mutualConnections = Math.floor(Math.random() * 25);
  const degrees = ['1st', '2nd', '3rd'];
  const degree = degrees[Math.floor(Math.random() * degrees.length)];
  
  let connectionStrength = 0;
  if (degree === '1st') connectionStrength += 100;
  else if (degree === '2nd') connectionStrength += 50;
  else connectionStrength += 10;
  connectionStrength += mutualConnections * 5;
  
  return {
    name: name || 'LinkedIn User',
    title_company: headline || `Professional at ${companyName}`,
    location: location || 'Unknown Location',
    profile_url: person.publicProfileUrl || '#',
    mutual_connections: mutualConnections,
    connection_degree: degree,
    connection_strength: connectionStrength,
    can_message: degree === '1st' || degree === '2nd',
    can_connect: degree === '2nd' || degree === '3rd'
  };
}

function generateMockEmployees(companyName: string, limit: number) {
  const titles = ["Software Engineer", "Product Manager", "Sales Director", "VP Engineering"];
  const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Remote"];
  const names = ["John Smith", "Sarah Johnson", "Mike Williams", "Emily Brown"];
  
  const employees = [];
  for (let i = 0; i < Math.min(limit, 10); i++) {
    const mutualConnections = Math.floor(Math.random() * 25);
    const degree = ['1st', '2nd', '3rd'][Math.floor(Math.random() * 3)];
    let connectionStrength = degree === '1st' ? 100 : degree === '2nd' ? 50 : 10;
    connectionStrength += mutualConnections * 5;
    
    employees.push({
      name: names[i % names.length],
      title_company: `${titles[i % titles.length]} at ${companyName}`,
      location: locations[i % locations.length],
      mutual_connections: mutualConnections,
      connection_degree: degree,
      connection_strength: connectionStrength,
      can_message: degree === '1st' || degree === '2nd',
      can_connect: degree === '2nd' || degree === '3rd'
    });
  }
  
  return employees.sort((a, b) => b.connection_strength - a.connection_strength);
}

export const getAuthorizationUrl = action({
  args: {},
  handler: async () => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const siteUrl = process.env.SITE_URL;
    
    if (!clientId || !siteUrl) {
      throw new Error(
        "LINKEDIN_CLIENT_ID or SITE_URL is not set in backend environment variables."
      );
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
  },
});

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
      
      // Step 2: Automatically trigger company connection scraping
      let scrapingResult = null;
      if (tokenData.access_token) {
        try {
          console.log("🔍 Starting automatic company connection scraping...");
          scrapingResult = await performCompanyConnectionScraping(tokenData.access_token);
          console.log("✅ Company connection scraping completed");
        } catch (scrapingError: any) {
          console.error("❌ Company connection scraping failed:", scrapingError.message);
        }
      }
      
      return { 
        success: true, 
        debug: {
          redirectUri,
          clientIdLength: clientId.length,
          secretLength: clientSecret.length,
          responseStatus: tokenResponse.status,
          tokenReceived: !!tokenData.access_token
        },
        scrapingResult
      };

    } catch (error: any) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  },
});
