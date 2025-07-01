import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function GitHubOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        setError(`GitHub authorization failed: ${error}`);
        setTimeout(() => navigate("/dashboard/github"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => navigate("/dashboard/github"), 3000);
        return;
      }

      try {
        const response = await fetch("/api/github/oauth/github/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ code, state }),
        });

        const data = (await response.json()) as {
          success?: boolean;
          error?: string;
        };

        if (response.ok && data.success) {
          // Success - close window if it's a popup, otherwise redirect
          if (window.opener) {
            window.close();
          } else {
            navigate("/dashboard/github");
          }
        } else {
          setError(data.error || "Failed to complete GitHub authorization");
          setTimeout(() => navigate("/dashboard/github"), 3000);
        }
      } catch (err) {
        console.error("Error completing GitHub OAuth:", err);
        setError("Failed to complete authorization");
        setTimeout(() => navigate("/dashboard/github"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-red-500">{error}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to GitHub integration page...
            </p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Completing GitHub authorization...</p>
          </>
        )}
      </div>
    </div>
  );
}
