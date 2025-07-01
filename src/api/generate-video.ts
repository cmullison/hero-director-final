import { auth } from "../lib/auth";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { Database } from "../lib/types";

interface GenerateVideoParams {
  prompt: string;
  seed?: number;
}

interface VideoJob {
  id: string;
  userId: string;
  prompt: string;
  model: string;
  aspect_ratio: string;
  seed?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  replicate_prediction_id?: string;
  video_url?: string;
  r2_url?: string;
  save_status?: 'saving' | 'saved' | 'failed';
  error_message?: string;
  settings?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface ActionResult {
  success: boolean;
  jobId?: string;
  job?: VideoJob;
  error?: string;
}

interface ReplicatePrediction {
  id: string;
  status: string;
  output?: string;
  error?: string;
  urls: {
    get: string;
    cancel?: string;
  };
}

// Helper function to generate unique job ID
function generateJobId(): string {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get user ID from cookie-based auth
async function getUserId(request: Request, env: any): Promise<string | null> {
  // Get auth token from cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const authToken = cookieHeader.match(/auth-token=([^;]+)/)?.[1] || null;
  
  if (!authToken || !env.DB) {
    return null;
  }
  
  try {
    // Setup DB connection
    const dbKysely = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });
    
    // Verify the session
    const session = await auth.verifySession(dbKysely, authToken);
    return session ? session.userId : null;
  } catch (error) {
    console.error("Error verifying session:", error);
    return null;
  }
}

// Start a new video generation job
export async function startVideoGeneration(
  params: GenerateVideoParams,
  env: any,
  request: Request
): Promise<ActionResult> {
  if (!params.prompt?.trim()) {
    return { success: false, error: "Prompt cannot be empty." };
  }

  const userId = await getUserId(request, env);
  if (!userId) {
    return { success: false, error: "Authentication required." };
  }

  console.log("Starting video generation with params:", params);

  if (!env.REPLICATE_API_TOKEN) {
    console.error("Missing REPLICATE_API_TOKEN");
    return {
      success: false,
      error: "Server configuration error: Missing Replicate API token",
    };
  }

  try {
    const jobId = generateJobId();
    const model = 'google/veo-3'; // Always use Veo-3
    
    // Prepare Replicate API request - only include prompt and seed
    const replicateBody = {
      input: {
        prompt: params.prompt,
        ...(params.seed !== undefined && { seed: params.seed })
      }
    };

    console.log("Sending request to Replicate:", replicateBody);

    // Start the prediction on Replicate
    const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replicateBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Replicate API failed (${response.status}): ${errorText}`);
      return {
        success: false,
        error: `Failed to start video generation: ${response.statusText}`,
      };
    }

    const prediction = await response.json() as ReplicatePrediction;
    console.log("Replicate prediction started:", prediction);

    // Save job to database without aspect_ratio
    const settingsJson = params.seed ? JSON.stringify({ seed: params.seed }) : undefined;
    const currentTimestamp = new Date().toISOString();
    
    const insertResult = await env.DB.prepare(`
      INSERT INTO video_jobs (
        id, userId, prompt, model, seed, status, 
        replicate_prediction_id, settings, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      jobId,
      userId,
      params.prompt,
      model,
      params.seed || null,
      'processing',
      prediction.id,
      settingsJson || null,
      currentTimestamp,
      currentTimestamp
    ).run();

    if (!insertResult.success) {
      console.error("Failed to save job to database:", insertResult.error);
      return {
        success: false,
        error: "Failed to save job to database",
      };
    }

    // Return the job info
    const job: VideoJob = {
      id: jobId,
      userId,
      prompt: params.prompt,
      model,
      aspect_ratio: '16:9', // Keep for backwards compatibility but not used
      seed: params.seed,
      status: 'processing',
      replicate_prediction_id: prediction.id,
      settings: settingsJson,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };

    return {
      success: true,
      jobId,
      job,
    };

  } catch (error) {
    console.error("Error starting video generation:", error);
    return {
      success: false,
      error: "Internal server error while starting video generation",
    };
  }
}

// Helper function to save video to R2
async function saveVideoToR2(
  env: any, 
  job: VideoJob, 
  videoUrl: string
): Promise<void> {
  try {
    // Update save status to 'saving'
    await env.DB.prepare(`
      UPDATE video_jobs SET save_status = 'saving' WHERE id = ?
    `).bind(job.id).run();

    // Fetch video from Replicate
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    
    const videoBlob = await response.arrayBuffer();
    
    // Generate path: video-generations/model-name/YYYY-MM-DD/jobId.mp4
    const date = new Date();
    const datePrefix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const modelName = job.model.split('/').pop() || 'unknown'; // Extract 'veo-3' from 'google/veo-3'
    const key = `video-generations/${modelName}/${datePrefix}/${job.id}.mp4`;
    
    // Save to R2
    await env.IMAGE_BUCKET.put(key, videoBlob, {
      httpMetadata: {
        contentType: 'video/mp4',
      },
      customMetadata: {
        jobId: job.id,
        userId: job.userId,
        model: job.model,
        prompt: job.prompt,
        originalUrl: videoUrl,
      },
    });
    
    // Update DB with R2 URL and save status
    await env.DB.prepare(`
      UPDATE video_jobs 
      SET r2_url = ?, save_status = 'saved' 
      WHERE id = ?
    `).bind(key, job.id).run();
    
    console.log(`Video saved to R2: ${key}`);
    
  } catch (error) {
    console.error(`Failed to save video to R2 for job ${job.id}:`, error);
    
    // Update save status to 'failed'
    await env.DB.prepare(`
      UPDATE video_jobs SET save_status = 'failed' WHERE id = ?
    `).bind(job.id).run();
  }
}

// Get job status and update from Replicate if needed
export async function getVideoJobStatus(
  jobId: string,
  env: any,
  request: Request,
  ctx?: any // Add context parameter for waitUntil
): Promise<ActionResult> {
  const userId = await getUserId(request, env);
  if (!userId) {
    return { success: false, error: "Authentication required." };
  }

  try {
    // Get job from database
    const jobResult = await env.DB.prepare(`
      SELECT * FROM video_jobs WHERE id = ? AND userId = ?
    `).bind(jobId, userId).first();

    if (!jobResult) {
      return { success: false, error: "Job not found." };
    }

    const job = jobResult as VideoJob;

    // If job is already completed or failed, return current status
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return { success: true, job };
    }

    // If job is still processing, check Replicate status
    if (job.replicate_prediction_id && env.REPLICATE_API_TOKEN) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${job.replicate_prediction_id}`,
        {
          headers: {
            'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
          },
        }
      );

      if (response.ok) {
        const prediction = await response.json() as ReplicatePrediction;
        
        // Update job status based on Replicate response
        let newStatus: VideoJob['status'] = job.status;
        let videoUrl = job.video_url;
        let errorMessage = job.error_message;
        let completedAt = job.completedAt;

        if (prediction.status === 'succeeded' && prediction.output) {
          newStatus = 'completed';
          videoUrl = prediction.output;
          completedAt = new Date().toISOString();
          
          // Auto-save to R2 if not already saved
          if (ctx && env.IMAGE_BUCKET && !job.r2_url && job.save_status !== 'saving' && job.save_status !== 'saved') {
            ctx.waitUntil(saveVideoToR2(env, job, prediction.output));
          }
        } else if (prediction.status === 'failed') {
          newStatus = 'failed';
          errorMessage = prediction.error || 'Video generation failed';
          completedAt = new Date().toISOString();
        } else if (prediction.status === 'canceled') {
          newStatus = 'cancelled';
          completedAt = new Date().toISOString();
        }

        // Update database if status changed
        if (newStatus !== job.status || videoUrl !== job.video_url) {
          await env.DB.prepare(`
            UPDATE video_jobs 
            SET status = ?, video_url = ?, error_message = ?, completedAt = ?
            WHERE id = ?
          `).bind(newStatus, videoUrl, errorMessage, completedAt, jobId).run();

          job.status = newStatus;
          job.video_url = videoUrl;
          job.error_message = errorMessage;
          job.completedAt = completedAt;
        }
      }
    }

    return { success: true, job };

  } catch (error) {
    console.error("Error getting job status:", error);
    return {
      success: false,
      error: "Internal server error while getting job status",
    };
  }
}

// Get all video jobs for a user
export async function getUserVideoJobs(
  env: any,
  request: Request,
  limit: number = 50,
  offset: number = 0
): Promise<{ success: boolean; jobs?: VideoJob[]; error?: string }> {
  const userId = await getUserId(request, env);
  if (!userId) {
    return { success: false, error: "Authentication required." };
  }

  try {
    const result = await env.DB.prepare(`
      SELECT * FROM video_jobs 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    return { success: true, jobs: result.results as VideoJob[] };

  } catch (error) {
    console.error("Error getting user video jobs:", error);
    return {
      success: false,
      error: "Internal server error while getting video jobs",
    };
  }
}

// Cancel a video generation job
export async function cancelVideoJob(
  jobId: string,
  env: any,
  request: Request
): Promise<ActionResult> {
  const userId = await getUserId(request, env);
  if (!userId) {
    return { success: false, error: "Authentication required." };
  }

  try {
    // Get job from database
    const jobResult = await env.DB.prepare(`
      SELECT * FROM video_jobs WHERE id = ? AND userId = ?
    `).bind(jobId, userId).first();

    if (!jobResult) {
      return { success: false, error: "Job not found." };
    }

    const job = jobResult as VideoJob;

    // Can only cancel pending or processing jobs
    if (job.status !== 'pending' && job.status !== 'processing') {
      return { success: false, error: "Job cannot be cancelled in current status." };
    }

    // Try to cancel on Replicate if we have a prediction ID
    if (job.replicate_prediction_id && env.REPLICATE_API_TOKEN) {
      try {
        await fetch(
          `https://api.replicate.com/v1/predictions/${job.replicate_prediction_id}/cancel`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
            },
          }
        );
      } catch (error) {
        console.warn("Failed to cancel on Replicate:", error);
        // Continue with local cancellation even if Replicate fails
      }
    }

    // Update job status in database
    await env.DB.prepare(`
      UPDATE video_jobs 
      SET status = 'cancelled', completedAt = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), jobId).run();

    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();

    return { success: true, job };

  } catch (error) {
    console.error("Error cancelling job:", error);
    return {
      success: false,
      error: "Internal server error while cancelling job",
    };
  }
} 