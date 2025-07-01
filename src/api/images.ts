// Image handling for R2 storage
import { env } from "cloudflare:workers";
import type { Env } from "../lib/types";

// Define Env interface for typechecking

// CORS configuration
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:8788",
//   "https://mulls.io",
//   "https://agents.mulls.io",
//   "https://blob.mulls.io"
// ];

// export function withCORS(response: Response, origin: string | null): Response {
//   if (origin && allowedOrigins.includes(origin)) {
//     const newResponse = new Response(response.body, response);
//     newResponse.headers.set("Access-Control-Allow-Origin", origin);
//     newResponse.headers.set("Access-Control-Allow-Credentials", "true");
//     newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//     return newResponse;
//   }
//   return response;
// }

/**
 * Handle image serving request
 */
export async function handleImageServing(
  request: Request,
  url: URL,
  env: Env
): Promise<Response> {
  if (!env.IMAGE_BUCKET) {
    return Response.json({ error: "R2 bucket not configured" }, { status: 500 });
  }

  // Remove the /images/ prefix from the path
  const imageKey = url.pathname.replace("/images/", "");
  const host = url.hostname;

  console.log("Image requested:", imageKey, "Host:", host);
  console.log("Accept header:", request.headers.get("Accept"));
  console.log("User-Agent:", request.headers.get("User-Agent"));

  try {
    // Define the prefixes we use for images
    const agentPrefix = "agent-uploads";
    const generatedPrefix = "generated-uploads";
    const inputPrefix = "input-images";

    // Try several different path formats in order:
    let possibleKeys = [
      // First try new folder-based format
      `${generatedPrefix}/${imageKey}`,
      `${agentPrefix}/${imageKey}`,
      `${inputPrefix}/${imageKey}`,
      // Then try old underscore format for backward compatibility
      `${generatedPrefix}_${imageKey}`,
      `${agentPrefix}_${imageKey}`,
      // Raw key as fallback
      imageKey,
    ];

    let object = null;
    let foundKey = "";

    // Try each key format until we find the image
    for (const key of possibleKeys) {
      console.log(`Looking for image with key: ${key}`);
      object = await env.IMAGE_BUCKET.get(key);
      if (object) {
        foundKey = key;
        console.log(`Found image with key: ${key}`);
        break;
      }
    }

    if (!object) {
      console.error("Image not found in R2 bucket with any key format");
      return Response.json({ error: "Image not found" }, { status: 404 });
    }

    // Return the image with appropriate content type and CORS headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=31536000");
    headers.set("Access-Control-Allow-Origin", "*"); // Allow any origin to load the image
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    // Log important response headers
    console.log(
      `Serving image ${foundKey} with content type:`,
      headers.get("content-type")
    );
    console.log("Content-Length:", headers.get("content-length"));

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return Response.json({ error: "Error serving image" }, { status: 500 });
  }
}

// Handle CORS preflight requests
// export function handleCorsRequest(request: Request): Response {
//   const origin = request.headers.get("Origin");
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : "*",
//       "Access-Control-Allow-Credentials": "true",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
//     }
//   });
// }

// Handle image redirection
export function handleImageRedirect(url: URL): Response {
  // Create a direct URL to the blob service with the same path
  const blobUrl = new URL(`https://blob.mulls.io${url.pathname}`);
  console.log(
    `Redirecting image request from ${url.toString()} to ${blobUrl.toString()}`
  );
  return Response.redirect(blobUrl.toString(), 307);
}
