interface EditImageParams {
  prompt: string;
  input_image: string;
  seed: number;
  aspect_ratio: string;
  output_format: string;
  safety_tolerance: number;
}

// Common result interface
interface ActionResult {
  success: boolean;
  imageUrls?: string[];
  error?: string;
}

// Interface for Replicate prediction status
interface ReplicatePrediction {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
  urls: {
    get: string;
    cancel?: string;
  };
}

// Helper function to sleep for polling
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to upload image to R2 for Replicate access
async function processInputImage(imageData: string, env: any): Promise<string> {
  // If it's already a URL, return as is
  if (imageData.startsWith("http")) {
    return imageData;
  }

  // If it's a data URL, upload it to R2 first
  if (imageData.startsWith("data:")) {
    if (!env.IMAGE_BUCKET) {
      throw new Error("IMAGE_BUCKET not configured in environment");
    }

    // Extract base64 data and content type
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URL format");
    }

    const contentType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Generate a unique filename
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const extension = contentType.split("/")[1] || "png";
    const filename = `input_${timestamp}_${randomId}.${extension}`;

    // Upload to R2
    const imageBucket = env.IMAGE_BUCKET;
    const uploadKey = `input-images/${filename}`;

    await imageBucket.put(uploadKey, imageBuffer, {
      httpMetadata: { contentType },
    });

    // Return the public URL
    const baseImagesUrl = env.IMAGES_URL || `${env.SITE_URL}/images`;
    // Note: We need to handle input-images in the image serving handler
    return `${baseImagesUrl}/input-images/${filename}`;
  }

  throw new Error("Unsupported image format");
}

// Configuration for polling
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 100;

export async function editImageAction(
  params: EditImageParams,
  env: any
): Promise<ActionResult> {
  if (!params.prompt) {
    return { success: false, error: "Prompt cannot be empty." };
  }

  if (!params.input_image) {
    return { success: false, error: "Input image is required." };
  }

  console.log("Editing image via AI Gateway with params:", params);

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

  console.log("[edit-image.ts] Environment vars check:");
  console.log(
    "[edit-image.ts] AI Gateway Token (first 5 chars):",
    aiGatewayToken ? aiGatewayToken.substring(0, 5) + "..." : "NOT SET"
  );
  console.log(
    "[edit-image.ts] Replicate API Token (first 5 chars):",
    replicateApiToken ? replicateApiToken.substring(0, 5) + "..." : "NOT SET"
  );
  console.log("[edit-image.ts] Account ID:", accountId || "NOT SET");
  console.log("[edit-image.ts] Gateway ID:", gatewayId || "NOT SET");

  if (!aiGatewayToken || !replicateApiToken || !accountId || !gatewayId) {
    console.error(
      "[edit-image.ts] Missing required environment variables/secrets."
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
    // Process the input image
    const processedImageUrl = await processInputImage(params.input_image, env);

    // Construct the input object for Replicate flux-kontext-pro
    const input = {
      prompt: params.prompt,
      input_image: processedImageUrl,
      seed: params.seed || undefined, // Don't send 0, let it be random
      aspect_ratio: params.aspect_ratio,
      output_format: params.output_format,
      safety_tolerance: params.safety_tolerance,
    };

    const requestBody = {
      version: "black-forest-labs/flux-kontext-pro",
      input: input,
    };

    const requestHeaders = {
      "cf-aig-authorization": `Bearer ${aiGatewayToken}`,
      Authorization: `Token ${replicateApiToken}`,
      "Content-Type": "application/json",
    };

    // Debug logging
    console.log("Edit image request details:", {
      url: `${gatewayBaseUrl}/predictions`,
      headers: {
        ...requestHeaders,
        "cf-aig-authorization": "Bearer [REDACTED]",
        Authorization: "Token [REDACTED]",
      },
      body: {
        ...requestBody,
        input: {
          ...requestBody.input,
          input_image: requestBody.input.input_image.substring(0, 50) + "...",
        },
      },
    });

    // Step 1: Initiate Prediction
    console.log(
      `Initiating image edit prediction via AI Gateway: ${gatewayBaseUrl}/predictions`
    );
    const initialResponse = await fetch(`${gatewayBaseUrl}/predictions`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const responseStatus = initialResponse.status;
    const responseBody = await initialResponse.text();

    console.log("Edit response details:", {
      status: responseStatus,
      body: responseBody,
    });

    if (!initialResponse.ok) {
      console.error(
        `Replicate edit request failed (${responseStatus}): ${responseBody}`
      );
      throw new Error(
        `Failed to initiate edit prediction: ${initialResponse.statusText} - ${responseBody}`
      );
    }

    let prediction: ReplicatePrediction = JSON.parse(responseBody);
    console.log(
      `Edit prediction initiated (ID: ${prediction.id}), status: ${prediction.status}`
    );

    if (!prediction.urls?.get) {
      console.error(
        "Initial edit prediction response missing 'urls.get':",
        prediction
      );
      throw new Error("Invalid response from edit prediction initiation.");
    }

    // Step 2: Poll for Result
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
        `Polling edit status (Attempt ${pollAttempt}/${MAX_POLL_ATTEMPTS}), URL: ${prediction.urls.get}`
      );

      const pollResponse = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${replicateApiToken}`,
        },
        cache: "no-store",
      });

      if (!pollResponse.ok) {
        const errorBody = await pollResponse.text();
        console.error(
          `Replicate edit polling request failed (${pollResponse.status}): ${errorBody}`
        );
        continue;
      }

      prediction = await pollResponse.json();
      console.log(
        `Edit polling update (ID: ${prediction.id}), status: ${prediction.status}`
      );
    }

    // Step 3: Process Final Result
    if (prediction.status === "succeeded") {
      console.log("Raw prediction output:", prediction.output);
      
      // Handle different output formats
      let imageUrls: string[] = [];
      
      if (typeof prediction.output === "string") {
        // flux-kontext-pro returns a single string URI
        imageUrls = [prediction.output];
      } else if (Array.isArray(prediction.output)) {
        // flux-schnell and others return an array
        imageUrls = prediction.output;
      } else {
        console.error(
          "Edit prediction succeeded but output format is unexpected:",
          prediction.output
        );
        return {
          success: false,
          error: "Edit prediction succeeded but output format is unexpected.",
        };
      }

      if (imageUrls.length === 0) {
        console.error(
          "Edit prediction succeeded but no image URLs were found:",
          prediction.output
        );
        return {
          success: false,
          error: "Edit prediction succeeded but no image URLs were returned.",
        };
      }

      console.log(
        `Successfully edited image. Result URLs: ${imageUrls.length}`
      );
      imageUrls.forEach((url, index) => {
        console.log(`Edited image ${index + 1}: ${url}`);
      });

      return {
        success: true,
        imageUrls: imageUrls,
      };
    } else if (
      prediction.status === "failed" ||
      prediction.status === "canceled"
    ) {
      console.error(
        `Edit prediction failed or was canceled. Status: ${prediction.status}, Error: ${prediction.error}`
      );
      return {
        success: false,
        error: `Edit prediction failed or canceled: ${prediction.error || "Unknown reason"}`,
      };
    } else {
      // Timeout case
      console.error(`Edit prediction timed out after ${pollAttempt} attempts.`);
      return { success: false, error: "Edit prediction timed out." };
    }
  } catch (error) {
    console.error("Edit image action failed:", error);
    let errorMessage = "Failed to edit image. Check server logs.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

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
      error: `Image editing failed: ${errorMessage}`,
    };
  }
}
