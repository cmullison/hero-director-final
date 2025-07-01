import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, sessionQueryKey } from "../lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { SignupForm } from "@/components/signup-form";

export default function Signup() {
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
      const result = await signup(email, password);

      if (result.success) {
        console.log("[Signup] Attempting query invalidation...");
        await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
        console.log("[Signup] Query invalidation finished.");

        try {
          console.log("[Signup] Refetching session query...");
          await queryClient.refetchQueries({
            queryKey: sessionQueryKey,
            exact: true,
          });
          console.log("[Signup] Session query refetch finished.");
        } catch (refetchError) {
          console.error(
            "[Signup] Error refetching session query:",
            refetchError
          );
        }

        setTimeout(() => {
          console.log("[Signup] Navigating to dashboard after delay.");
          navigate("/dashboard");
        }, 50);
      } else {
        // Handle user already exists error
        if (result.error?.toLowerCase().includes("user already exists")) {
          setError(
            "An account with this email already exists. Please try logging in instead."
          );
        }
        // Handle missing fields error
        else if (
          result.error?.toLowerCase().includes("missing email or password")
        ) {
          setError("Please fill in all required fields.");
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
          console.error("[Signup] Error details:", result.error);
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      console.error("[Signup] Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-muted flex flex-col items-center justify-center h-screen">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-[800px] mx-auto">
          <SignupForm onSubmit={handleSubmit} />
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
