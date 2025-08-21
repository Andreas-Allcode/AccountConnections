# Real LinkedIn Scraping Setup

## Quick Start

1. **Start the scraping API:**
   ```bash
   cd /Users/andreas/AccountConnections
   ./start_scraper.sh
   ```

2. **Test your app:**
   ```bash
   cd vly-app
   npm run dev
   ```

## How It Works

### 1. LinkedIn Authentication
- User logs in via LinkedIn OAuth
- Gets access token and company info
- Triggers scraping for their company

### 2. Real Scraping Process
- Convex calls Python scraping API at `http://localhost:8000/scrape`
- Python scraper searches LinkedIn for company employees
- Extracts real employee data: names, titles, locations, connection degrees
- Returns structured data to your app

### 3. Data Extracted
For each employee:
- ✅ Real name
- ✅ Job title and company
- ✅ Location
- ✅ LinkedIn profile URL
- ✅ Connection degree (1st, 2nd, 3rd)
- ✅ Mutual connections count
- ✅ Connection strength score
- ✅ Messaging/connection capabilities

## Important Notes

### ⚠️ LinkedIn Terms of Service
- This scrapes LinkedIn's public search results
- Use responsibly and respect rate limits
- Consider LinkedIn's ToS for your use case
- For production, consider LinkedIn's official APIs

### 🔧 Session Management
- The scraper works without login for public data
- For better results, you can add LinkedIn session cookies
- Session cookies expire and need refreshing

### 📊 Rate Limiting
- Built-in delays between requests (1-3 seconds)
- Limits results to prevent blocking
- Randomized timing to appear more human

## Troubleshooting

### If scraping fails:
1. Check if the Python API is running on port 8000
2. Verify the company name is correct
3. Check console logs for specific errors
4. Falls back to mock data if real scraping fails

### If you get blocked:
1. Wait a few minutes before trying again
2. Use different search terms
3. Consider adding session cookies for authenticated access

## Production Considerations

For production use:
1. Deploy the Python API to a server
2. Update the API URL in `convex/scraping.ts`
3. Implement proper error handling and monitoring
4. Consider LinkedIn's official Partner APIs for compliance