import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function LinkedInCallback() {
  // CHANGED: Using debug handler instead of regular one
  const handleLinkedInCallbackDebug = useAction(api.linkedin.handleLinkedInCallbackDebug);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<{title: string, description: string} | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // In a real app, you should verify the 'state' parameter matches what you sent
    // to prevent Cross-Site Request Forgery (CSRF) attacks.
    if (code) {
      console.log("Starting LinkedIn callback with code:", code.substring(0, 10) + "...");
      
      // CHANGED: Using debug handler
      handleLinkedInCallbackDebug({ code })
        .then((result) => {
          console.log("Debug result:", result);
          toast.success("Successfully authenticated with LinkedIn!");
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("LinkedIn callback error:", err);
          const errorMessage = String(err.message || "An unknown error occurred.");
          
          // Enhanced error display for debugging
          console.log("Full error details:", {
            message: err.message,
            stack: err.stack,
            name: err.name
          });
          
          const requestIdMatch = errorMessage.match(/\[Request ID: ([\w\d]+)\]/);
          const requestId = requestIdMatch ? requestIdMatch[1] : null;

          if (requestId) {
            setError({
              title: "Authentication Failed",
              description: `A server error occurred. Please contact support with this ID: ${requestId}`
            });
          } else {
            setError({
              title: "Authentication Failed - DEBUG MODE",
              description: `${errorMessage}\n\nCheck your Convex logs for detailed debug information.`
            });
          }
        });
    } else {
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      if (errorParam) {
        console.error(`LinkedIn auth error: ${errorParam} - ${errorDescription}`);
        setError({
          title: "LinkedIn Authentication Failed",
          description: errorDescription ?? "An unknown error occurred."
        });
        navigate("/");
      }
    }
  }, [searchParams, handleLinkedInCallbackDebug, navigate]);

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Alert variant="destructive" className="max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">
            {error.description}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        <div className="text-sm text-muted-foreground max-w-lg text-center">
          <p><strong>Debug Mode Active:</strong></p>
          <p>Check your Convex dashboard logs for detailed error information.</p>
          <p>Look for sections marked "=== TOKEN EXCHANGE RESPONSE ===" in the logs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">
        Authenticating with LinkedIn... (Debug Mode)
      </p>
      <p className="text-sm text-muted-foreground">
        Check Convex logs for detailed debug information
      </p>
    </div>
  );
}
