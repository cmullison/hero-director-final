import { GoogleGenAI } from "@google/genai";
import { auth } from "../lib/auth";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { Database } from "../lib/types";

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

// GET /api/google-video-jobs - List all jobs for the user
export async function GET(request: Request, env: any): Promise<Response> {
  const userId = await getUserId(request, env);
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: "Authentication required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const result = await env.DB.prepare(`
      SELECT * FROM google_video_jobs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    return new Response(
      JSON.stringify({ success: true, jobs: result.results || [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error getting Google video jobs:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to get video jobs" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// GET /api/google-video-jobs/:id - Get status of a specific job
export async function getJobStatus(
  jobId: string,
  env: any,
  request: Request,
  ctx?: any
): Promise<Response> {
  const userId = await getUserId(request, env);
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: "Authentication required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Get job from database
    const jobResult = await env.DB.prepare(`
      SELECT * FROM google_video_jobs WHERE id = ? AND userId = ?
    `).bind(jobId, userId).first();

    if (!jobResult) {
      return new Response(
        JSON.stringify({ success: false, error: "Job not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const job = jobResult as GoogleVideoJob;

    // If job is already completed or failed, return current status
    if (job.status === 'completed' || job.status === 'failed') {
      return new Response(
        JSON.stringify({ success: true, job }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // If job is still processing, check Google operation status
    if (job.google_operation_name && (env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY)) {
      const apiKey = env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || env.GOOGLE_CLOUD_PROJECT_ID;
      
      if (!projectId) {
        console.error("[Google Video] Google Cloud project ID not configured");
        return new Response(
          JSON.stringify({ success: true, job }), // Return current job status
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        console.log(`[Google Video] Checking status for operation: ${job.google_operation_name}`);
        
        // Extract model ID from operation name
        const operationParts = job.google_operation_name.split('/');
        const modelId = operationParts[operationParts.indexOf('models') + 1];
        
        const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${modelId}:fetchPredictOperation`;
        
        const requestPayload = {
          operationName: job.google_operation_name
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload)
        });

        const operation = await response.json() as {
          name?: string;
          done?: boolean;
          response?: {
            videos?: Array<{
              gcsUri?: string;
              mimeType?: string;
            }>;
            generatedSamples?: Array<{
              video?: {
                uri?: string;
                encoding?: string;
              };
            }>;
          };
          error?: {
            message?: string;
          };
        };

        console.log(`[Google Video] Operation status:`, {
          done: operation.done,
          hasResponse: !!operation.response,
          hasError: !!operation.error
        });

        // Update job status based on Google response
        let newStatus: 'pending' | 'processing' | 'completed' | 'failed' = job.status;
        let videoUrl = job.video_url;
        let errorMessage = job.error_message;
        let completedAt = job.completedAt;

        if (operation.done) {
          if (operation.response?.generatedSamples && operation.response.generatedSamples.length > 0) {
            const generatedVideo = operation.response.generatedSamples[0];
            const videoUri = generatedVideo.video?.uri;
            
            if (videoUri) {
              newStatus = 'completed';
              videoUrl = videoUri; // Google Cloud Storage URL doesn't need API key
              completedAt = new Date().toISOString();
              console.log(`[Google Video] Video completed: ${videoUrl}`);
            } else {
              newStatus = 'failed';
              errorMessage = 'No video URI in response';
              completedAt = new Date().toISOString();
            }
          } else if (operation.error) {
            newStatus = 'failed';
            errorMessage = (operation.error as any)?.message || 'Video generation failed';
            completedAt = new Date().toISOString();
          } else {
            newStatus = 'failed';
            errorMessage = 'No video generated';
            completedAt = new Date().toISOString();
          }
        }

        // Update database if status changed
        if (newStatus !== job.status || videoUrl !== job.video_url) {
          await env.DB.prepare(`
            UPDATE google_video_jobs 
            SET status = ?, video_url = ?, error_message = ?, completedAt = ?, updatedAt = ?
            WHERE id = ?
          `).bind(
            newStatus, 
            videoUrl, 
            errorMessage, 
            completedAt, 
            new Date().toISOString(),
            jobId
          ).run();

          job.status = newStatus;
          job.video_url = videoUrl;
          job.error_message = errorMessage;
          job.completedAt = completedAt;
          job.updatedAt = new Date().toISOString();
        }
      } catch (error) {
        console.error(`[Google Video] Error checking operation status:`, error);
        // Don't fail the request, just return the current job status
      }
    }

    return new Response(
      JSON.stringify({ success: true, job }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error getting job status:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to get job status" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 