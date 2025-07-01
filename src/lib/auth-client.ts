import { useState, useEffect } from "react";
// Import react-query hooks
import { useQuery, useQueryClient } from "@tanstack/react-query";

// // Get the worker URL from environment variables
// // Ensure VITE_WORKER_URL is set in your .env file (e.g., VITE_WORKER_URL=https://your-worker.your-account.workers.dev)
// const WORKER_URL = import.meta.env.VITE_WORKER_URL; // Commented out

// if (!WORKER_URL) { // Commented out
// console.error("VITE_WORKER_URL environment variable is not set!");
// // Optionally throw an error or set a default, but failing loudly is often better during development
// throw new Error("VITE_WORKER_URL environment variable is not set!");
// } // Commented out

// // Helper function to create full API URLs
function getApiUrl(path: string): string {
  // Ensure the path starts with a /
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  // Calls are now same-origin, so we don't need WORKER_URL prefix.
  // Browsers will use the current origin.
  return formattedPath; // Ensure this returns only the relative path
}

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  teams: {
    name: string;
    logo: string;
    plan: string;
  }[];
}

interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

interface AuthResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

// Mock user for development environment
const DEV_USER = {
  id: "dev-user",
  email: "dev@mulls.io",
  name: "Development User",
  image: null,
  teams: [
    {
      name: "Dev Team",
      logo: "",
      plan: "developer",
    },
  ],
};

// Define the fetch function for the session query
const fetchSession = async (): Promise<SessionResponse> => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // If VITE_API_MOCKING is true, or similar dev flag, return mock user
    // For simplicity, keeping existing DEV_USER logic.
    // You might want to make this conditional on another env var if you
    // want to test against a real dev worker sometimes.
    return {
      authenticated: true,
      user: DEV_USER,
    };
  }
  // Path is now relative due to changes in getApiUrl
  const res = await fetch(getApiUrl("/api/auth/session"), {
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return { authenticated: false };
    }
    throw new Error("Failed to fetch session status");
  }
  const data: SessionResponse = await res.json();
  return data;
};

// Define the query key
export const sessionQueryKey = ["session"];

export function useSession() {
  const { data, isLoading, error, isError } = useQuery<SessionResponse, Error>({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // Keep session data fresh for 5 mins
    gcTime: 15 * 60 * 1000, // Keep data in cache for 15 mins
    retry: 1, // Retry once on error
    refetchOnWindowFocus: true, // Refetch session when window regains focus
    // Added an explicit initial value for isAuthenticated to avoid undefined during loading
    // initialData: () => ({ authenticated: false }), // Keep or remove as per preference
  });

  return {
    // Derive user from the query data
    user: data?.authenticated ? data.user : null,
    // Expose loading state
    loading: isLoading,
    // Expose error state/object
    error: isError ? error : null,
    // Expose raw authenticated flag if needed
    isAuthenticated: data?.authenticated ?? false,
  };
}

export async function login(email: string, password: string) {
  // WORKER_URL check is removed as it's no longer used for constructing the URL
  try {
    // Path is now relative due to changes in getApiUrl
    const res = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Login failed");
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function signup(email: string, password: string) {
  // WORKER_URL check is removed
  try {
    // Path is now relative due to changes in getApiUrl
    const res = await fetch(getApiUrl("/api/auth/signup"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data: AuthResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Signup failed");
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function logout() {
  // WORKER_URL check is removed
  try {
    // Path is now relative due to changes in getApiUrl
    const res = await fetch(getApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export const authClient = {
  useSession,
  login,
  signup,
  logout,
  sessionQueryKey, // Export the key for invalidation
};
