// Debug script to show current redirect URI
const SITE_URL = "https://main.d1234567890123.amplifyapp.com"; // Replace with your actual Amplify URL

const redirectUri = new URL("/linkedin-callback", SITE_URL).toString();

console.log("=== LinkedIn Redirect URI Debug ===");
console.log("SITE_URL:", SITE_URL);
console.log("Generated redirect URI:", redirectUri);
console.log("");
console.log("Add this EXACT URL to your LinkedIn app settings:");
console.log("👉", redirectUri);
console.log("");
console.log("LinkedIn Developer Console:");
console.log("https://www.linkedin.com/developers/apps");