import type { R2Bucket } from "@cloudflare/workers-types";

/**
 * Helper to convert base64 to ArrayBuffer
 * Used for both OpenAI base64 responses and data URLs
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Helper to extract base64 data from a data URL
 * Example: "data:image/png;base64,iVBORw0KGg..." -> "iVBORw0KGg..."
 */
function extractBase64FromDataUrl(dataUrl: string): string | null {
  const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  return matches[2];
}

/**
 * Result interface for a single image save operation
 */
interface SaveImageResult {
  success: boolean;
  originalIndex: number; // To map back to original request array, and also used as part of filename
  base64Provided: boolean; // To indicate if base64 data was actually provided for this image
  error?: string;
  path?: string; // The path/key in R2
  contentType?: string;
  url?: string; // Public URL to access the image
}

/**
 * Result interface for the entire batch save operation
 */
interface SaveImagesActionResult {
  success: boolean;
  results: SaveImageResult[];
  error?: string;
}

/**
 * Function to save a single image from URL or base64
 *
 * This function handles both:
 * 1. HTTP URLs (from Replicate API)
 * 2. Data URLs with base64 (from OpenAI API or frontend)
 * 3. Plain base64 strings (from OpenAI API)
 *
 * All images are converted to WebP format for consistency.
 */
async function saveSingleImage(
  imageData: string,
  prompt: string,
  imageBucket: R2Bucket,
  index: number,
  env: any
): Promise<SaveImageResult> {
  if (!imageData) {
    console.warn(
      `[SaveImage] Empty image data provided for index ${index}, skipping.`
    );
    return {
      success: false,
      originalIndex: index,
      base64Provided: false,
      error: "Image data is missing.",
    };
  }

  console.log(`[SaveImage] Processing image #${index + 1}`);

  try {
    let contentType = "image/webp";
    let imageBuffer: ArrayBuffer;
    let isBase64 = false;

    // Check if the image is a data URL with base64 encoding
    if (imageData.startsWith("data:")) {
      const base64Data = extractBase64FromDataUrl(imageData);
      if (!base64Data) {
        throw new Error("Invalid data URL format");
      }
      imageBuffer = base64ToArrayBuffer(base64Data);
      isBase64 = true;

      // Extract content type from the data URL
      const mimeMatch = imageData.match(/^data:([^;]+);/);
      if (mimeMatch && mimeMatch[1]) {
        contentType = mimeMatch[1];
      }
    } else if (imageData.startsWith("http")) {
      // It's a URL, fetch the image
      console.log(`[SaveImage] Fetching image from URL: ${imageData}`);
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image from URL: ${response.statusText}`
        );
      }
      imageBuffer = await response.arrayBuffer();
      contentType = response.headers.get("content-type") || "image/webp";
    } else {
      // Assume it's a plain base64 string
      imageBuffer = base64ToArrayBuffer(imageData);
      isBase64 = true;
    }

    // Generate a unique filename - limit length to avoid R2 key limitations
    const safePrompt = prompt.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20); // Reduce from 50 to 20 chars
    const extension = "webp";
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp (seconds) is shorter
    // Add a random component to ensure uniqueness
    const randomId = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const filename = `${timestamp}_${index}_${randomId}_${safePrompt}.${extension}`;

    // Use proper folder-based prefixing with a forward slash
    const prefix = "generated-uploads";
    const finalKey = `${prefix}/${filename}`;

    // Upload the image to R2
    console.log(
      `[SaveImage] Uploading image #${index + 1} to R2 bucket with key: ${finalKey} (Content-Type: ${contentType})`
    );
    await imageBucket.put(finalKey, imageBuffer, {
      httpMetadata: { contentType: "image/webp" }, // Force image/webp content type
    });

    // Generate a public URL for the image
    const baseImagesUrl = env.IMAGES_URL || `${env.SITE_URL}/images`;
    // Use just the filename without the path prefix - the image handler will add the prefix
    const publicUrl = `${baseImagesUrl}/${filename}`;

    console.log(
      `[SaveImage] Successfully uploaded image #${index + 1} as ${finalKey}`
    );
    return {
      success: true,
      originalIndex: index,
      base64Provided: isBase64,
      path: filename,
      contentType: "image/webp",
      url: publicUrl,
    };
  } catch (error: any) {
    console.error(`[SaveImage] Error processing image #${index + 1}:`, error);
    let errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during image saving.";

    // Check for specific R2 error codes
    if (
      errorMessage.includes("10043") ||
      errorMessage.includes("key too long")
    ) {
      errorMessage =
        "Filename too long for storage. This usually happens with very long prompts.";
      console.error(
        `[SaveImage] R2 key length limitation hit for image #${index + 1}`
      );
    }

    return {
      success: false,
      originalIndex: index,
      base64Provided: true,
      error: errorMessage,
    };
  }
}

/**
 * Main function to save multiple images to R2 bucket
 *
 * This function is used by:
 * 1. The Replicate image generator (automatic save after generation)
 * 2. The OpenAI image generator (both automatic and manual save)
 *
 * @param imageUrls - Array of image URLs or base64 data
 * @param prompt - Prompt used to generate the images (used for filename)
 * @param env - Environment object containing R2 bucket binding
 * @returns SaveImagesActionResult with status and details for each image
 */
export async function saveImageAction(
  imageUrls: string[], // Input can be URLs or base64 data
  prompt: string,
  env: any // Environment containing R2 bucket binding
): Promise<SaveImagesActionResult> {
  if (!env || !env.IMAGE_BUCKET) {
    console.error(
      "[SaveImage] R2 bucket ('IMAGE_BUCKET') not available in env. Check server.ts and wrangler.toml."
    );
    return {
      success: false,
      results: imageUrls.map((_, i) => ({
        success: false,
        originalIndex: i,
        base64Provided: !!imageUrls[i]?.startsWith("data:"),
        error:
          "Server configuration error: R2 bucket not available in environment.",
      })),
      error:
        "Server configuration error: R2 bucket not available in environment.",
    };
  }
  const imageBucket = env.IMAGE_BUCKET as R2Bucket;

  if (typeof imageBucket.put !== "function") {
    console.error(
      "[SaveImage] IMAGE_BUCKET binding does not appear to be a valid R2Bucket instance."
    );
    return {
      success: false,
      results: imageUrls.map((_, i) => ({
        success: false,
        originalIndex: i,
        base64Provided: !!imageUrls[i]?.startsWith("data:"),
        error: "Server configuration error: R2 bucket binding invalid.",
      })),
      error: "Server configuration error: R2 bucket binding invalid.",
    };
  }

  if (!imageUrls || imageUrls.length === 0) {
    console.warn("[SaveImage] No images provided to saveImageAction.");
    return {
      success: false,
      results: [],
      error: "No image data provided.",
    };
  }

  // Ensure prompt is not too long, even for saving - limit to 20 chars for filenames
  const shortPrompt = prompt.length > 20 ? prompt.slice(0, 20) : prompt;

  console.log(`[SaveImage] Attempting to save ${imageUrls.length} image(s)...`);

  // Log each URL we're trying to save
  imageUrls.forEach((url, i) => {
    console.log(`[SaveImage] Attempting to save image: ${url}`);
  });

  const results = await Promise.all(
    imageUrls.map((imageData, index) =>
      saveSingleImage(imageData, shortPrompt, imageBucket, index, env)
    )
  );

  // Log save results for debugging
  results.forEach((result, i) => {
    if (result.success) {
      console.log(`[SaveImage] Save successful: ${result.path}`);
    } else {
      console.error(
        `[SaveImage] Save failed for image #${i + 1}: ${result.error}`
      );
    }
  });

  const allSucceeded = results.every((result) => result.success);
  console.log(
    "[SaveImage] Finished saving images. Overall success:",
    allSucceeded
  );

  return {
    success: allSucceeded,
    results,
    error: allSucceeded
      ? undefined
      : "Some images failed to save. Check individual results.",
  };
}
