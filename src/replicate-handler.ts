import { z } from "zod";
import axios from "axios";

interface FluxInput {
  prompt: string;
  go_fast?: boolean;
  megapixels?: "1" | "0.25";
  num_outputs?: number;
  aspect_ratio?:
    | "1:1"
    | "16:9"
    | "21:9"
    | "3:2"
    | "2:3"
    | "4:5"
    | "5:4"
    | "3:4"
    | "4:3"
    | "9:16"
    | "9:21";
  output_format?: "webp" | "jpg" | "png";
  output_quality?: number;
  num_inference_steps?: number;
  disable_safety_checker?: boolean;
  seed?: number | null;
}

export class ReplicateHandler {
  private axiosInstance;
  private readonly MODEL = "black-forest-labs/flux-schnell";

  constructor(apiToken: string) {
    this.axiosInstance = axios.create({
      baseURL: "https://api.replicate.com/v1",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  async generateImage(params: {
    prompt: string;
    aspect_ratio?: FluxInput["aspect_ratio"] | "1:1";
    output_format?: FluxInput["output_format"] | "webp";
    num_outputs?: number | 1;
    megapixels?: FluxInput["megapixels"] | "1";
    output_quality?: number | 80;
    num_inference_steps?: number | 4;
    disable_safety_checker?: boolean | true;
    seed?: number | null;
  }) {
    const input: FluxInput = {
      prompt: params.prompt,
    };

    // Add optional parameters if they exist
    if (params.aspect_ratio) {
      input.aspect_ratio = params.aspect_ratio;
    }
    if (params.output_format) {
      input.output_format = params.output_format;
    }
    if (params.num_outputs) {
      input.num_outputs = Math.min(Math.max(1, params.num_outputs), 4);
    }
    if (params.megapixels) {
      input.megapixels = params.megapixels;
    }
    if (params.output_quality) {
      input.output_quality = params.output_quality;
    }
    if (params.num_inference_steps) {
      input.num_inference_steps = params.num_inference_steps;
    }
    if (params.disable_safety_checker) {
      input.disable_safety_checker = params.disable_safety_checker;
    }
    if (params.seed) {
      input.seed = params.seed;
    }
    try {
      // Create prediction
      const createResponse = await this.axiosInstance.post("/predictions", {
        version: this.MODEL,
        input,
      });

      const predictionId = createResponse.data.id;

      // Poll for completion
      while (true) {
        const getResponse = await this.axiosInstance.get(
          `/predictions/${predictionId}`
        );
        const prediction = getResponse.data;

        if (prediction.status === "succeeded") {
          return {
            status: "success",
            output: prediction.output,
          };
        } else if (prediction.status === "failed") {
          return {
            status: "error",
            message: prediction.error || "Unknown error",
          };
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message: error.response?.data?.detail || error.message,
        };
      }
      return {
        status: "error",
        message: String(error),
      };
    }
  }
}
