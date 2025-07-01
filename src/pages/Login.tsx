import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, sessionQueryKey } from "../lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { LoginForm } from "@/components/login-form";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log("[Login] Attempting query invalidation...");
        await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
        console.log("[Login] Query invalidation finished.");

        try {
          console.log("[Login] Refetching session query...");
          await queryClient.refetchQueries({
            queryKey: sessionQueryKey,
            exact: true,
          });
          console.log("[Login] Session query refetch finished.");
        } catch (refetchError) {
          console.error(
            "[Login] Error refetching session query:",
            refetchError
          );
        }

        setTimeout(() => {
          console.log("[Login] Navigating to dashboard after delay.");
          navigate("/dashboard");
        }, 50);
      } else {
        // Generic error message for invalid credentials
        if (result.error?.toLowerCase().includes("invalid email or password")) {
          setError(
            "The email or password you entered is incorrect. Please try again."
          );
        }
        // Handle connection/server errors
        else if (
          result.error?.toLowerCase().includes("failed to fetch") ||
          result.error?.toLowerCase().includes("network") ||
          result.error?.toLowerCase().includes("connection")
        ) {
          setError(
            "We're having trouble connecting to our servers. Please check your internet connection and try again."
          );
        }
        // Generic error for other cases
        else {
          setError("Something went wrong. Please try again later.");
          console.error("[Login] Error details:", result.error);
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      console.error("[Login] Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-muted flex flex-col items-center justify-center h-screen">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-[800px] mx-auto">
          <LoginForm onSubmit={handleSubmit} />
          {error && (
            <div className="mt-4 p-4 text-red-600 bg-red-50 rounded-md text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
