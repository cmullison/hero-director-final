/**
 * Helper function to create full API URLs
 * @param path API path to format
 * @returns Formatted API URL path
 */
export function getApiUrl(path: string): string {
  // Ensure the path starts with a /
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  // Calls are same-origin, so we don't need WORKER_URL prefix.
  // Browsers will use the current origin.
  return formattedPath;
}

// Define common response types for API calls
export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  profile?: T;
  message?: string;
}

/**
 * Generic fetch function with proper error handling
 * @param url API URL to fetch
 * @param options Fetch options
 * @returns Response data
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      ("error" in data || "message" in data)
        ? (data as { error?: string; message?: string }).error ||
          (data as { error?: string; message?: string }).message ||
          "API request failed"
        : "API request failed";

    throw new Error(errorMessage);
  }

  return data as ApiResponse<T>;
}
