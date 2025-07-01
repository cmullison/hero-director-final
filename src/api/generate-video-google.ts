import { GoogleGenAI } from "@google/genai";
import { auth } from "../lib/auth";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { Database } from "../lib/types";

interface VideoGenerationRequest {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  personGeneration?: "allow" | "disallow";
}

interface VideoGenerationResponse {
  success: boolean;
  jobId?: string;
  job?: GoogleVideoJob;
  error?: string;
}

interface GoogleVideoJob {
  id: string;
  userId: string;
  prompt: string;
  aspectRatio: string;
  personGeneration: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  google_operation_name?: string;
  video_url?: string;
  error_message?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Helper function to generate unique job ID
function generateJobId(): string {
  return `google_video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get user ID from cookie-based auth
async function getUserId(request: Request, env: any): Promise<string | null> {
  const cookieHeader = request.headers.get('Cookie') || '';
  const authToken = cookieHeader.match(/auth-token=([^;]+)/)?.[1] || null;
  
  if (!authToken || !env.DB) {
    return null;
  }
  
  try {
    const dbKysely = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });
    
    const session = await auth.verifySession(dbKysely, authToken);
    return session ? session.userId : null;
  } catch (error) {
    console.error("Error verifying session:", error);
    return null;
  }
}

export async function POST(request: Request, env: any): Promise<Response> {
  console.log("[Google Video] Starting video generation request");
  
  try {
    const requestBody = await request.json();
    console.log("[Google Video] Request body:", JSON.stringify(requestBody, null, 2));
    
    const { prompt, aspectRatio = "16:9", personGeneration = "allow" } = requestBody as VideoGenerationRequest;

    if (!prompt) {
      console.error("[Google Video] Error: Prompt is required");
      return new Response(
        JSON.stringify({ success: false, error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user ID
    const userId = await getUserId(request, env);
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Google Video] Processing request for user:", userId);

    const apiKey = process.env.GOOGLE_API_KEY || env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("[Google Video] Error: Google API key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Google API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Google Cloud project ID
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || env.GOOGLE_CLOUD_PROJECT_ID;
    if (!projectId) {
      console.error("[Google Video] Error: Google Cloud project ID not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Google Cloud project ID not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Google Video] Making direct API call to Google Cloud Vertex AI");

    // Generate job ID
    const jobId = generateJobId();
    const currentTimestamp = new Date().toISOString();

    try {
      // Make direct HTTP call to Google Cloud Vertex AI
      const modelId = "veo-3.0-generate-preview";
      const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${modelId}:predictLongRunning`;
      
      const requestPayload = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          outputConfig: {
            mimeType: "video/mp4"
          },
          videoConfig: {
            aspectRatio: aspectRatio,
            personGeneration: personGeneration
          }
        }
      };

      console.log("[Google Video] API URL:", apiUrl);
      console.log("[Google Video] Request payload:", JSON.stringify(requestPayload, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      const responseData = await response.json() as { name?: string; error?: any };
      console.log("[Google Video] API response:", JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      const operationName = responseData.name;
      if (!operationName) {
        throw new Error("No operation name returned from API");
      }

      // Save job to database
      const insertResult = await env.DB.prepare(`
        INSERT INTO google_video_jobs (
          id, userId, prompt, aspectRatio, personGeneration, status, 
          google_operation_name, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        jobId,
        userId,
        prompt,
        aspectRatio,
        personGeneration,
        'processing',
        operationName,
        currentTimestamp,
        currentTimestamp
      ).run();

      if (!insertResult.success) {
        console.error("[Google Video] Failed to save job to database:", insertResult.error);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to save job to database" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Return the job info
      const job: GoogleVideoJob = {
        id: jobId,
        userId,
        prompt,
        aspectRatio,
        personGeneration,
        status: 'processing',
        google_operation_name: operationName,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      };

      console.log("[Google Video] Job created successfully:", jobId);

      return new Response(
        JSON.stringify({ success: true, jobId, job }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("[Google Video] Error starting video generation:", error);
      console.error("[Google Video] Error details:", {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to start video generation" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("[Google Video] Caught error during request processing:");
    console.error("[Google Video] Error type:", (error as any)?.constructor?.name);
    console.error("[Google Video] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[Google Video] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 