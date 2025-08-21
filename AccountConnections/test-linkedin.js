// Quick test to check LinkedIn API status
const clientId = "86mkalf0kacmkr";
const redirectUri = "https://main.d165ycqnmbuafx.amplifyapp.com/linkedin-callback";

console.log("LinkedIn App Check:");
console.log("Client ID:", clientId);
console.log("Redirect URI:", redirectUri);
console.log("");
console.log("Test this URL in browser:");
console.log(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test&scope=openid%20profile%20email`);
console.log("");
console.log("If this fails, your LinkedIn app has issues.");
console.log("If this works but callback fails, it's the API endpoint.");