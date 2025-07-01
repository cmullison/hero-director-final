interface GenerateImageParams {
  prompt: string;
  seed: number;
  go_fast: boolean;
  megapixels: string; // Keep as string as per form
  num_outputs: number;
  aspect_ratio: string;
  output_format: string;
  output_quality: number;
  num_inference_steps: number;
  disable_safety_checker: boolean;
}

// Interface for OpenAI image generation - used by gpt-img.tsx
interface OpenAIImageParams {
  prompt: string; // The text prompt to generate an image from
  n: number; // Number of images to generate
  size: string; // Image size, e.g. "1024x1024", "1792x1024", etc.
  quality: string; // "standard" or "hd"
  style?: string; // Optional style parameter ("vivid" or "natural")
  model?: string; // Optional model override, defaults to "gpt-image-1"
  output_compression?: number; // Optional quality setting for WebP conversion
  output_format?: string; // Optional output format, defaults to "webp"
}

// Common result interface for both Replicate and OpenAI image generation
interface ActionResult {
  success: boolean;
  imageUrls?: string[]; // Used by Replicate (direct URLs) and for saved OpenAI images
  base64Images?: string[]; // Used by OpenAI when returning base64-encoded images
  error?: string; // Error message if success is false
}

// Interface for Replicate prediction status - Replicate specific
interface ReplicatePrediction {
  id: string; // Prediction ID
  status: string; // Status: "succeeded", "failed", "canceled", "processing"
  output?: string[]; // Array of image URLs when status is "succeeded"
  error?: string; // Error message when status is "failed"
  urls: {
    get: string; // URL to poll for updates
    cancel?: string; // URL to cancel the prediction
  };
}

// Helper function for sleeping during polling
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to read a stream into a buffer (might not be needed if output is always URLs)
// Keep it for now in case Replicate API changes or returns data directly sometimes
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

// Helper function to convert ArrayBuffer to base64 string
// Not strictly needed if OpenAI returns b64_json directly, but can be useful
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ===== OPENAI (GPT-IMAGE-1) IMPLEMENTATION =====
// This function handles image generation via OpenAI's API using gpt-image-1 model
// Unlike Replicate, OpenAI returns immediately with base64 image data
export async function generateImageOpenAI(
  params: OpenAIImageParams,
  env: any
): Promise<ActionResult> {
  if (!params.prompt) {
    return { success: false, error: "Prompt cannot be empty." };
  }

  console.log("Generating image via OpenAI with params:", params);

  if (!env) {
    console.error("Environment variables not available");
    return {
      success: false,
      error: "Server configuration error: Environment variables unavailable",
    };
  }

  // Get API key and base URL from env
  const openaiApiKey = env.OPENAI_API_KEY;
  let openaiBaseURL = env.OPENAI_BASE_URL || env.GATEWAY_BASE_URL;
  
  // Ensure the base URL includes the OpenAI provider suffix for Cloudflare gateway
  if (openaiBaseURL && openaiBaseURL.includes('gateway.ai.cloudflare.com') && !openaiBaseURL.includes('/openai')) {
    openaiBaseURL = openaiBaseURL + '/openai';
  }

  if (!openaiApiKey || !openaiBaseURL) {
    console.error(
      "[generate-image.ts] Missing required OpenAI credentials or gateway URL."
    );
    return {
      success: false,
      error:
        "Server configuration error: Missing API credentials or gateway URL.",
    };
  }

  // Debug variables
  console.log("[generate-image.ts] Environment vars check for OpenAI:");
  console.log(
    "[generate-image.ts] OpenAI API Key (first 5 chars):",
    openaiApiKey ? openaiApiKey.substring(0, 5) + "..." : "NOT SET"
  );
  console.log(
    "[generate-image.ts] OpenAI Base URL:",
    openaiBaseURL || "NOT SET"
  );

  try {
    // Prepare the request body with proper typing
    const requestBody: any = {
      model: params.model || "gpt-image-1",
      prompt: params.prompt,
      n: params.n || 1,
      size: params.size || "1024x1024",
      quality: params.quality || "high",
      output_format: params.output_format || "webp",
    };

    // Prepare the request headers
    const requestHeaders = {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    };

    // Debug logging
    console.log("OpenAI Image Request details:", {
      url: `${openaiBaseURL}/v1/images/generations`,
      headers: {
        ...requestHeaders,
        Authorization: "Bearer [REDACTED]",
      },
      body: requestBody,
    });

    // Send the request to OpenAI's image generation API
    const response = await fetch(`${openaiBaseURL}/v1/images/generations`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `OpenAI image generation failed (${response.status}): ${errorText}`
      );
      return {
        success: false,
        error: `Failed to generate image: ${response.statusText} - ${errorText}`,
      };
    }

    // Define the expected response type
    interface OpenAIImageResponse {
      created: number;
      data: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>;
      error?: {
        message: string;
      };
    }

    const result = (await response.json()) as OpenAIImageResponse;

    if (result.error) {
      console.error("OpenAI API returned an error:", result.error.message);
      return {
        success: false,
        error: `OpenAI API Error: ${result.error.message}`,
      };
    }

    if (!result.data || !Array.isArray(result.data)) {
      console.error("Unexpected response format from OpenAI:", result);
      return {
        success: false,
        error: "Invalid response format from image generation API.",
      };
    }

    // Extract image base64 data and URLs from the response
    const base64Images: string[] = [];
    const imageUrls: string[] = [];

    result.data.forEach((item) => {
      if (item.b64_json) {
        base64Images.push(item.b64_json);
      }
      if (item.url) {
        imageUrls.push(item.url);
      }
    });

    if (base64Images.length === 0 && imageUrls.length === 0) {
      return {
        success: false,
        error: "No images (b64_json or URL) were returned from OpenAI.",
      };
    }

    // Return either URLs or base64 based on what's available
    if (imageUrls.length > 0) {
      console.log(
        `Successfully generated ${imageUrls.length} image URL(s) via OpenAI.`
      );
      return {
        success: true,
        imageUrls: imageUrls,
      };
    } else if (base64Images.length > 0) {
      console.log(
        `Successfully generated ${base64Images.length} base64 image(s) via OpenAI.`
      );
      return {
        success: true,
        base64Images: base64Images,
      };
    }

    // This code should never be reached due to the previous check, but add a fallback return
    return {
      success: false,
      error: "No images were generated (fallback error).",
    };
  } catch (error: any) {
    console.error("OpenAI generate image action failed:", error);
    let errorMessage = "Failed to generate image(s). Check server logs.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return {
      success: false,
      error: `Image generation failed: ${errorMessage}`,
    };
  }
}

// ===== REPLICATE (FLUX SCHNELL) CONFIGURATION =====
// Hardcoded Replicate model version: black-forest-labs/flux-schnell
// This section is specific to Replicate's API which requires polling for results
const POLL_INTERVAL_MS = 1500; // Check status every 1.5 seconds
const MAX_POLL_ATTEMPTS = 100; // Max ~2.5 minutes of polling

export async function generateImageAction(
  params: GenerateImageParams,
  env: any
): Promise<ActionResult> {
  // NEW CODE: Check if we should use OpenAI (dall-e) instead of Replicate
  if (
    env.USE_OPENAI_FOR_IMAGES === "true" ||
    env.USE_OPENAI_FOR_IMAGES === true
  ) {
    console.log(
      "Using OpenAI for image generation as USE_OPENAI_FOR_IMAGES is true."
    );
    const frontendParams = params as any;

    const openaiAPIParams: OpenAIImageParams = {
      prompt: frontendParams.prompt,
      n: frontendParams.n || 1,
      size: frontendParams.size || "1024x1024",
      quality: frontendParams.quality || "high",
      model: "gpt-image-1",
      output_compression: frontendParams.output_compression || 80,
      output_format: frontendParams.output_format || "webp",
    };

    console.log("Parameters for OpenAI API call:", openaiAPIParams);
    // This call now returns { success: boolean, base64Images?: string[], error?: string }
    return generateImageOpenAI(openaiAPIParams, env);
  }

  // Rest of the existing Replicate implementation
  // IMPORTANT: The Replicate path below still uses imageUrls.
  // This will cause a type error if this path is taken, as ActionResult now expects base64Images.
  // This part needs to be refactored to fetch image data and convert to base64 if Replicate is to be used.
  // For now, the focus is on the OpenAI path used by gpt-img.tsx.
  if (!params.prompt) {
    return { success: false, error: "Prompt cannot be empty." };
  }

  console.log("Generating image via AI Gateway with params:", params);

  if (!env) {
    console.error("Environment variables not available");
    return {
      success: false,
      error: "Server configuration error: Environment variables unavailable",
    };
  }

  // Get API tokens and gateway info from env
  const aiGatewayToken = env.AI_GATEWAY_TOKEN;
  const replicateApiToken = env.REPLICATE_API_TOKEN;
  const accountId = env.ACCOUNT_ID || env.AI_GATEWAY_ACCOUNT_ID;
  const gatewayId = env.AI_GATEWAY_ID || env.GATEWAY_URL;
  const replicateBaseUrl = env.REPLICATE_BASE_URL;

  // Debug variables
  console.log("[generate-image.ts] Environment vars check:");
  console.log(
    "[generate-image.ts] AI Gateway Token (first 5 chars):",
    aiGatewayToken ? aiGatewayToken.substring(0, 5) + "..." : "NOT SET"
  );
  console.log(
    "[generate-image.ts] Replicate API Token (first 5 chars):",
    replicateApiToken ? replicateApiToken.substring(0, 5) + "..." : "NOT SET"
  );
  console.log("[generate-image.ts] Account ID:", accountId || "NOT SET");
  console.log("[generate-image.ts] Gateway ID:", gatewayId || "NOT SET");
  console.log(
    "[generate-image.ts] Replicate Base URL:",
    replicateBaseUrl || "NOT SET (will construct from parts)"
  );

  if (!aiGatewayToken || !replicateApiToken || !accountId || !gatewayId) {
    console.error(
      "[generate-image.ts] Missing required environment variables/secrets."
    );
    return {
      success: false,
      error:
        "Server configuration error: Missing API credentials or gateway info.",
    };
  }

  // Use the provided base URL if available, otherwise construct it
  const gatewayBaseUrl =
    replicateBaseUrl ||
    `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/replicate`;

  try {
    // Construct the input object for Replicate
    const input = {
      prompt: params.prompt,
      seed: params.seed,
      go_fast: params.go_fast,
      megapixels: params.megapixels.toString(),
      num_outputs: params.num_outputs,
      aspect_ratio: params.aspect_ratio,
      output_format: params.output_format,
      output_quality: params.output_quality,
      num_inference_steps: params.num_inference_steps,
      disable_safety_checker: params.disable_safety_checker,
    };

    const requestBody = {
      version: "black-forest-labs/flux-schnell",
      input: input,
    };

    const requestHeaders = {
      "cf-aig-authorization": `Bearer ${aiGatewayToken}`,
      Authorization: `Token ${replicateApiToken}`,
      "Content-Type": "application/json",
    };

    // Debug logging
    console.log("Request details:", {
      url: `${gatewayBaseUrl}/predictions`,
      headers: {
        ...requestHeaders,
        "cf-aig-authorization": "Bearer [REDACTED]",
        Authorization: "Token [REDACTED]",
      },
      body: requestBody,
    });

    // --- Step 1: Initiate Prediction ---
    console.log(
      `Initiating prediction via AI Gateway: ${gatewayBaseUrl}/predictions`
    );
    const initialResponse = await fetch(`${gatewayBaseUrl}/predictions`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const responseStatus = initialResponse.status;
    // Convert headers to object for logging using a compatible approach
    const responseHeaders: Record<string, string> = {};
    initialResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    const responseBody = await initialResponse.text();

    console.log("Response details:", {
      status: responseStatus,
      headers: responseHeaders,
      body: responseBody,
    });

    if (!initialResponse.ok) {
      console.error(
        `Replicate initial request failed (${responseStatus}): ${responseBody}`
      );
      throw new Error(
        `Failed to initiate prediction: ${initialResponse.statusText} - ${responseBody}`
      );
    }

    let prediction: ReplicatePrediction = JSON.parse(responseBody);
    console.log(
      `Prediction initiated (ID: ${prediction.id}), status: ${prediction.status}`
    );

    if (!prediction.urls?.get) {
      console.error(
        "Initial prediction response missing 'urls.get':",
        prediction
      );
      throw new Error("Invalid response from prediction initiation.");
    }

    // --- Step 2: Poll for Result ---
    let pollAttempt = 0;
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      prediction.status !== "canceled" &&
      pollAttempt < MAX_POLL_ATTEMPTS
    ) {
      pollAttempt++;
      await sleep(POLL_INTERVAL_MS);
      console.log(
        `Polling status (Attempt ${pollAttempt}/${MAX_POLL_ATTEMPTS}), URL: ${prediction.urls.get}`
      );

      const pollResponse = await fetch(prediction.urls.get, {
        // Use the status URL from prediction
        headers: {
          Authorization: `Token ${replicateApiToken}`,
          // No Content-Type needed for GET
        },
        cache: "no-store", // Ensure fresh status
      });

      if (!pollResponse.ok) {
        const errorBody = await pollResponse.text();
        console.error(
          `Replicate polling request failed (${pollResponse.status}): ${errorBody}`
        );
        // Don't throw immediately, maybe temporary? Let loop retry or timeout.
        // Consider adding logic for specific retryable errors if needed.
        continue; // Try polling again after delay
      }

      prediction = await pollResponse.json();
      console.log(
        `Polling update (ID: ${prediction.id}), status: ${prediction.status}`
      );
    }

    // --- Step 3: Process Final Result ---
    if (prediction.status === "succeeded") {
      if (!Array.isArray(prediction.output) || prediction.output.length === 0) {
        console.error(
          "Prediction succeeded but output is missing or not an array:",
          prediction.output
        );
        return {
          success: false,
          error: "Prediction succeeded but no image URLs were returned.",
        };
      }

      // Assuming output is an array of HTTPS URLs
      const imageUrls = prediction.output;

      console.log(`Successfully generated ${imageUrls.length} image(s).`);
      imageUrls.forEach((url, index) => {
        console.log(`Image ${index + 1}: ${url}`); // Log full URL here
      });
      // Return the URLs as originally designed
      return {
        success: true,
        imageUrls: imageUrls,
      };

      // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (
      prediction.status === "failed" ||
      prediction.status === "canceled"
    ) {
      console.error(
        `Prediction failed or was canceled. Status: ${prediction.status}, Error: ${prediction.error}`
      );
      return {
        success: false,
        error: `Prediction failed or canceled: ${prediction.error || "Unknown reason"}`,
      };
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      // Timeout case
      console.error(`Prediction timed out after ${pollAttempt} attempts.`);
      return { success: false, error: "Prediction timed out." };
    }
  } catch (error: any) {
    console.error("Generate image action failed:", error);
    let errorMessage = "Failed to generate image(s). Check server logs.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    // Ensure the specific config error is surfaced if it occurred before the try block
    if (errorMessage.includes("Missing API credentials")) {
      return {
        success: false,
        error:
          "Server configuration error: Missing API credentials or gateway info.",
      };
    }
    if (errorMessage.includes("Environment variables unavailable")) {
      return {
        success: false,
        error: "Server configuration error: Environment variables unavailable.",
      };
    }
    return {
      success: false,
      error: `Image generation failed: ${errorMessage}`,
    };
  }
}

// ===== FRONTEND ADAPTER FOR OPENAI =====
// This function adapts frontend parameters from gpt-img.tsx to OpenAI API format
export async function generateImageOpenAIFromFrontendAction(
  params: {
    prompt: string;
    n: number;
    size: string;
    quality: string;
    output_compression?: number;
    output_format?: string;
  },
  env: any
): Promise<ActionResult> {
  console.log(
    "Received request for generateImageOpenAIFromFrontendAction with params:",
    params
  );

  const openaiAPIParams: OpenAIImageParams = {
    prompt: params.prompt,
    n: params.n || 1,
    size: params.size || "1024x1024", // Default
    quality: params.quality || "high", // Default
    output_compression: params.output_compression || 80, // Default
    output_format: params.output_format || "webp", // Default to webp if not specified
    model: "gpt-image-1",
    // DO NOT add response_format parameter at all
  };

  console.log(
    "Calling generateImageOpenAI with mapped params:",
    openaiAPIParams
  );
  return generateImageOpenAI(openaiAPIParams, env);
}
