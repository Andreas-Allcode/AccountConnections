import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";

export function LinkedInTest() {
  const getAuthorizationUrl = useAction(api.linkedin.getAuthorizationUrl);
  const handleLinkedInCallbackDebug = useAction(api.linkedin.handleLinkedInCallbackDebug);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for authorization code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log("🔍 Found authorization code in URL:", code.substring(0, 20) + "...");
      setIsLoading(true);
      
      handleLinkedInCallbackDebug({ code })
        .then((result) => {
          console.log("✅ Success:", result);
          setResult(result);
          setError(null);
        })
        .catch((err) => {
          console.error("❌ Error:", err);
          setError(err.message);
          setResult(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [handleLinkedInCallbackDebug]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authUrl = await getAuthorizationUrl();
      console.log("🔗 Redirecting to:", authUrl);
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("❌ Failed to get authorization URL:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>LinkedIn OAuth + Company Connection Scraper</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#0077B5',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Loading...' : 'Continue with LinkedIn'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          border: '1px solid #f44336',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#f44336', margin: '0 0 10px 0' }}>Error:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{error}</pre>
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          border: '1px solid #4caf50',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#4caf50', margin: '0 0 10px 0' }}>Success!</h3>
          
          {result.scrapingResult && (
            <div style={{ marginBottom: '20px' }}>
              <h4>Company Connections Found:</h4>
              <p><strong>Total Connections:</strong> {result.scrapingResult.totalConnections}</p>
              
              {result.scrapingResult.targetCompanies?.map((company: any, idx: number) => (
                <div key={idx} style={{ 
                  marginBottom: '15px', 
                  padding: '10px', 
                  backgroundColor: '#f0f8f0',
                  borderRadius: '5px'
                }}>
                  <h5 style={{ margin: '0 0 10px 0' }}>{company.company} ({company.total_found} employees)</h5>
                  {company.employees.slice(0, 3).map((emp: any, empIdx: number) => (
                    <div key={empIdx} style={{ fontSize: '12px', marginBottom: '5px' }}>
                      <strong>{emp.name}</strong> - {emp.title_company} 
                      <span style={{ color: '#666' }}> ({emp.connection_degree}, {emp.mutual_connections} mutual)</span>
                    </div>
                  ))}
                  {company.employees.length > 3 && (
                    <div style={{ fontSize: '12px', color: '#666' }}>...and {company.employees.length - 3} more</div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <details>
            <summary>Full Debug Info</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Set your environment variables in Convex dashboard</li>
          <li>Click "Continue with LinkedIn"</li>
          <li>Authorize the app on LinkedIn</li>
          <li>The app will automatically scrape company connections after login</li>
          <li>Check the results above and console for debug information</li>
        </ol>
        
        <h4>Required Environment Variables:</h4>
        <ul>
          <li><code>LINKEDIN_CLIENT_ID</code> - Your LinkedIn app's Client ID</li>
          <li><code>LINKEDIN_CLIENT_SECRET</code> - Your LinkedIn app's Client Secret</li>
          <li><code>SITE_URL</code> - https://accountconnections.vly.site</li>
        </ul>
      </div>
    </div>
  );
}
