import {
  Agent,
  routeAgentRequest,
  type Connection,
  type WSMessage,
} from "agents";

import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import type { Message } from "ai";
import { handleImageServing } from "./api/images";
import {
  generateImageAction,
  generateImageOpenAIFromFrontendAction,
} from "./api/generate-image";
import { editImageAction } from "./api/edit-image";
import { saveImageAction } from "./api/save-image";
import { 
  startVideoGeneration, 
  getVideoJobStatus, 
  getUserVideoJobs, 
  cancelVideoJob 
} from "./api/generate-video";
import { 
  startKlingVideoGeneration, 
  getKlingVideoJobStatus, 
  getUserKlingVideoJobs, 
  cancelKlingVideoJob 
} from "./api/generate-video-kling";
import saveCodeHandler from "./api/save-code";
import profileRouter from "./api/profile";
import teamsRouter from "./api/teams";
import filesRouter from "./api/files";
import projectRouter from "./api/project";
import githubRouter from "./api/github";
import { handleGetConversations } from "./api/get-conversations";
import { savedSessionsHandler } from "./api/saved-sessions";
import type { D1Database, R2Bucket, ExecutionContext } from "@cloudflare/workers-types";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { auth } from "./lib/auth";
import type { Database, UserConversationsTable } from "./lib/types";
import { v4 as uuidv4 } from "uuid";
import { env } from "cloudflare:workers";
import type { Env } from "./lib/types";
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { getCookie } from 'hono/cookie';
import type { R2ListOptions, R2HTTPMetadata, R2Object, R2Objects } from '@cloudflare/workers-types';
import { handleCloudflareRequest } from "./api/cloudflare-dashboard";
import { chatAPI } from "./api/chat";

// Export the agents
// export { Sequential, Routing, Parallel, Orchestrator, Evaluator };

// Cloudflare AI Gateway
const openai = createOpenAI({
  apiKey: (env as any).OPENAI_API_KEY || "",
  baseURL: (env as any).GATEWAY_BASE_URL || "",
});

// CORS configuration
export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8788",
  "https://mulls.io",
  "https://hd.mulls.io",
  "https://blob.mulls.io",
];

type HonoContext = {
  Bindings: Env;
  Variables: {
    db: Kysely<Database>;
    user?: { id: string };
  };
};

const app = new Hono<HonoContext>();

// Setup CORS middleware
app.use('*', cors({
  origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
  allowMethods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// Middleware for agent requests (websockets)
app.use('*', async (c, next) => {
  if (c.req.header('Upgrade') === 'websocket') {
    const agentResponse = await routeAgentRequest(c.req.raw, c.env, { cors: true });
    if (agentResponse) {
      return agentResponse;
    }
  }
  await next();
});

// Database middleware
app.use('*', async (c, next) => {
  if (!c.env.DB) {
    return c.json({ error: 'Database not configured' }, 500);
  }
  const d1Dialect = new D1Dialect({ database: c.env.DB });
  const db = new Kysely<Database>({ dialect: d1Dialect });
  c.set('db', db);
  await next();
});

// Auth session verification middleware
const authMiddleware = async (c: Context<HonoContext>, next: any) => {
  const authToken = getCookie(c, 'auth-token');
  if (!authToken) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  const db = c.get('db');
  const session = await auth.verifySession(db, authToken);
  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }
  c.set('user', { id: session.userId });
  await next();
};

// createAgent is a helper function to generate an agent class
// with helpers for sending/receiving messages to the client and updating the status
function createAgent<
  Props extends Record<string, unknown>,
  Output extends Record<string, unknown>,
>(
  name: string,
  workflow: (
    props: Props,
    ctx: {
      toast: (message: string) => void;
      openai: OpenAIProvider;
    }
  ) => Promise<Output>
) {
  return class AnthropicAgent extends Agent<Env> {
    openai = createOpenAI({
      apiKey: this.env.OPENAI_API_KEY,
      baseURL: `https://gateway.ai.cloudflare.com/v1/${this.env.AI_GATEWAY_ACCOUNT_ID}/${this.env.AI_GATEWAY_ID}/openai`,
      headers: {
        "cf-aig-authorization": `Bearer ${this.env.AI_GATEWAY_TOKEN}`,
      },
    });
    static options = {
      hibernate: true,
    };
    status: {
      isRunning: boolean;
      output: string | undefined;
    } = {
      isRunning: false,
      output: undefined,
    };

    onConnect(connection: Connection) {
      connection.send(
        JSON.stringify({
          type: "status",
          status: this.status,
        })
      );
    }

    toast = (message: string, type: "info" | "error" = "info") => {
      this.broadcast(
        JSON.stringify({
          type: "toast",
          toast: {
            message,
            type,
          },
        })
      );
    };

    onMessage(connection: Connection, message: WSMessage) {
      const data = JSON.parse(message as string);
      switch (data.type) {
        case "run":
          this.run({ input: data.input });
          break;
        case "stop":
          this.setStatus({ ...this.status, isRunning: false });
          break;
        default:
          console.error("Unknown message type", data.type);
      }
    }

    setStatus(status: typeof this.status) {
      this.status = status;
      this.broadcast(JSON.stringify({ type: "status", status: this.status }));
    }

    async run(data: { input: Record<string, string> }) {
      if (this.status.isRunning) return;
      this.setStatus({ isRunning: true, output: undefined });

      try {
        const result = await workflow(data.input as Props, {
          toast: this.toast,
          openai: this.openai,
        });
        this.setStatus({ isRunning: false, output: JSON.stringify(result) });
      } catch (error) {
        this.toast(`An error occurred: ${error}`);
        this.setStatus({ isRunning: false, output: JSON.stringify(error) });
      }
    }
  };
}

// Here are the patterns, implemented as simple async functions
// These were copied directly from the AI SDK examples
// https://sdk.vercel.ai/docs/foundations/agents

// A SequentialProcessing class to process tasks in a sequential manner
export const Sequential = createAgent<{ input: string }, { copy: string }>(
  "Sequential",
  async (
    props: { input: string },
    ctx: { toast: (message: string) => void; openai: OpenAIProvider }
  ) => {
    console.log("Sequential", props);
    // This agent uses a prompt chaining workflow, ideal for tasks that can be decomposed into fixed subtasks.
    // It trades off latency for higher accuracy by making each LLM call an easier task.
    const model = ctx.openai("gpt-4o");

    // First step: Generate marketing copy
    const { text: copy } = await generateText({
      model,
      prompt: `Write persuasive marketing copy for: ${props.input}. Focus on benefits and emotional appeal.`,
    });
    ctx.toast("Copy generated");

    // Perform quality check on copy
    const { object: qualityMetrics } = await generateObject({
      model,
      schema: z.object({
        hasCallToAction: z.boolean(),
        emotionalAppeal: z.number().min(1).max(10),
        clarity: z.number().min(1).max(10),
      }),
      prompt: `Evaluate this marketing copy for:
      1. Presence of call to action (true/false)
      2. Emotional appeal (1-10)
      3. Clarity (1-10)
  
      Copy to evaluate: ${copy}`,
    });
    ctx.toast("Quality check complete");
    // If quality check fails, regenerate with more specific instructions
    if (
      !qualityMetrics.hasCallToAction ||
      qualityMetrics.emotionalAppeal < 7 ||
      qualityMetrics.clarity < 7
    ) {
      const { text: improvedCopy } = await generateText({
        model,
        prompt: `Rewrite this marketing copy with:
        ${!qualityMetrics.hasCallToAction ? "- A clear call to action" : ""}
        ${
          qualityMetrics.emotionalAppeal < 7
            ? "- Stronger emotional appeal"
            : ""
        }
        ${qualityMetrics.clarity < 7 ? "- Improved clarity and directness" : ""}
  
        Original copy: ${copy}`,
      });
      return { copy: improvedCopy, qualityMetrics };
    }

    ctx.toast("Copy improved");

    return { copy, qualityMetrics };
  }
);

// A Routing class to route tasks to the appropriate agent
export const Routing = createAgent<{ query: string }, { response: string }>(
  "Routing",
  async (
    props: { query: string },
    ctx: { toast: (message: string) => void; openai: OpenAIProvider }
  ) => {
    // This agent uses a routing workflow, which classifies input and directs it to specialized follow-up tasks.
    // It is effective for complex tasks with distinct categories that are better handled separately.
    const model = ctx.openai("gpt-4o");

    // First step: Classify the query type
    const { object: classification } = await generateObject({
      model,
      schema: z.object({
        reasoning: z.string(),
        type: z.enum(["general", "refund", "technical"]),
        complexity: z.enum(["simple", "complex"]),
      }),
      prompt: `Classify this customer query:
      ${props.query}
  
      Determine:
      1. Query type (general, refund, or technical)
      2. Complexity (simple or complex)
      3. Brief reasoning for classification`,
    });
    ctx.toast("Query classified");
    // Route based on classification
    // Set model and system prompt based on query type and complexity
    const { text: response } = await generateText({
      model:
        classification.complexity === "simple"
          ? ctx.openai("gpt-4o-mini")
          : ctx.openai("o1-mini"),
      system: {
        general:
          "You are an expert customer service agent handling general inquiries.",
        refund:
          "You are a customer service agent specializing in refund requests. Follow company policy and collect necessary information.",
        technical:
          "You are a technical support specialist with deep product knowledge. Focus on clear step-by-step troubleshooting.",
      }[classification.type],
      prompt: props.query,
    });
    ctx.toast("Response generated");
    return { response, classification };
  }
);

// A ParallelProcessing class to process tasks in parallel
export const Parallel = createAgent<
  { code: string },
  { reviews: unknown; summary: string }
>(
  "Parallel",
  async (
    props: { code: string },
    ctx: { toast: (message: string) => void; openai: OpenAIProvider }
  ) => {
    // This agent uses a parallelization workflow, effective for tasks that can be divided into independent subtasks.
    // It allows for speed and multiple perspectives, improving confidence in results.
    const model = ctx.openai("gpt-4o");

    // Run parallel reviews
    const [securityReview, performanceReview, maintainabilityReview] =
      await Promise.all([
        generateObject({
          model,
          system:
            "You are an expert in code security. Focus on identifying security vulnerabilities, injection risks, and authentication issues.",
          schema: z.object({
            vulnerabilities: z.array(z.string()),
            riskLevel: z.enum(["low", "medium", "high"]),
            suggestions: z.array(z.string()),
          }),
          prompt: `Review this code:
      ${props.code}`,
        }),

        generateObject({
          model,
          system:
            "You are an expert in code performance. Focus on identifying performance bottlenecks, memory leaks, and optimization opportunities.",
          schema: z.object({
            issues: z.array(z.string()),
            impact: z.enum(["low", "medium", "high"]),
            optimizations: z.array(z.string()),
          }),
          prompt: `Review this code:
      ${props.code}`,
        }),

        generateObject({
          model,
          system:
            "You are an expert in code quality. Focus on code structure, readability, and adherence to best practices.",
          schema: z.object({
            concerns: z.array(z.string()),
            qualityScore: z.number().min(1).max(10),
            recommendations: z.array(z.string()),
          }),
          prompt: `Review this code:
      ${props.code}`,
        }),
      ]);

    ctx.toast("Code reviews complete");

    const reviews = [
      { ...securityReview.object, type: "security" },
      { ...performanceReview.object, type: "performance" },
      { ...maintainabilityReview.object, type: "maintainability" },
    ];

    // Aggregate results using another model instance
    const { text: summary } = await generateText({
      model,
      system: "You are a technical lead summarizing multiple code reviews.",
      prompt: `Synthesize these code review results into a concise summary with key actions:
    ${JSON.stringify(reviews, null, 2)}`,
    });

    ctx.toast("Code review summary complete");

    return { reviews, summary };
  }
);

// An OrchestratorWorker class to orchestrate the workers
export const Orchestrator = createAgent<
  { featureRequest: string },
  {
    plan: {
      files: { purpose: string; filePath: string; changeType: string }[];
      estimatedComplexity: string;
    };
    changes: {
      file: { purpose: string; filePath: string; changeType: string };
      implementation: {
        code: string;
        explanation: string;
      };
    }[];
  }
>(
  "Orchestrator",
  async (
    props: { featureRequest: string },
    ctx: { toast: (message: string) => void; openai: OpenAIProvider }
  ) => {
    // This agent uses an orchestrator-workers workflow, suitable for complex tasks where subtasks aren't pre-defined.
    // It dynamically breaks down tasks and delegates them to worker LLMs, synthesizing their results.
    const { object: implementationPlan } = await generateObject({
      model: ctx.openai("o1"),
      schema: z.object({
        files: z.array(
          z.object({
            purpose: z.string(),
            filePath: z.string(),
            changeType: z.enum(["create", "modify", "delete"]),
          })
        ),
        estimatedComplexity: z.enum(["low", "medium", "high"]),
      }),
      system:
        "You are a senior software architect planning feature implementations.",
      prompt: `Analyze this feature request and create an implementation plan:
      ${props.featureRequest}`,
    });
    ctx.toast("Implementation plan created");
    // Workers: Execute the planned changes
    const fileChanges = await Promise.all(
      implementationPlan.files.map(async (file) => {
        // Each worker is specialized for the type of change
        const workerSystemPrompt = {
          create:
            "You are an expert at implementing new files following best practices and project patterns.",
          modify:
            "You are an expert at modifying existing code while maintaining consistency and avoiding regressions.",
          delete:
            "You are an expert at safely removing code while ensuring no breaking changes.",
        }[file.changeType];

        const { object: change } = await generateObject({
          model: ctx.openai("gpt-4o"),
          schema: z.object({
            explanation: z.string(),
            code: z.string(),
          }),
          system: workerSystemPrompt,
          prompt: `Implement the changes for ${file.filePath} to support:
          ${file.purpose}
  
          Consider the overall feature ctx:
          ${props.featureRequest}`,
        });
        ctx.toast("File change implemented");
        return {
          file,
          implementation: change,
        };
      })
    );

    ctx.toast("File changes implemented");
    return {
      plan: implementationPlan,
      changes: fileChanges,
    };
  }
);

// An EvaluatorOptimizer class to evaluate and optimize the agents
export const Evaluator = createAgent(
  "Evaluator",
  async (
    props: { text: string; targetLanguage: string },
    ctx: { toast: (message: string) => void; openai: OpenAIProvider }
  ) => {
    const model = ctx.openai("gpt-4o");

    let currentTranslation = "";
    let iterations = 0;
    const MAX_ITERATIONS = 1;

    // Initial translation
    const { text: translation } = await generateText({
      model: ctx.openai("gpt-4o-mini"), // use small model for first attempt
      system: "You are an expert literary translator.",
      prompt: `Translate this text to ${props.targetLanguage}, preserving tone and cultural nuances:
      ${props.text}`,
    });

    ctx.toast("Initial translation complete");

    currentTranslation = translation;

    // Evaluation-optimization loop
    while (iterations < MAX_ITERATIONS) {
      // Evaluate current translation
      const { object: evaluation } = await generateObject({
        model,
        schema: z.object({
          qualityScore: z.number().min(1).max(10),
          preservesTone: z.boolean(),
          preservesNuance: z.boolean(),
          culturallyAccurate: z.boolean(),
          specificIssues: z.array(z.string()),
          improvementSuggestions: z.array(z.string()),
        }),
        system: "You are an expert in evaluating literary translations.",
        prompt: `Evaluate this translation:
  
        Original: ${props.text}
        Translation: ${currentTranslation}
  
        Consider:
        1. Overall quality
        2. Preservation of tone
        3. Preservation of nuance
        4. Cultural accuracy`,
      });

      ctx.toast(`Evaluation complete: ${evaluation.qualityScore}`);

      // Check if quality meets threshold
      if (
        evaluation.qualityScore >= 8 &&
        evaluation.preservesTone &&
        evaluation.preservesNuance &&
        evaluation.culturallyAccurate
      ) {
        break;
      }

      // Generate improved translation based on feedback
      const { text: improvedTranslation } = await generateText({
        model: ctx.openai("gpt-4o"), // use a larger model
        system: "You are an expert literary translator.",
        prompt: `Improve this translation based on the following feedback:
        ${evaluation.specificIssues.join("\n")}
        ${evaluation.improvementSuggestions.join("\n")}
  
        Original: ${props.text}
        Current Translation: ${currentTranslation}`,
      });

      ctx.toast("Improved translation complete");

      currentTranslation = improvedTranslation;
      iterations++;
    }

    ctx.toast("Final translation complete");

    return {
      finalTranslation: currentTranslation,
      iterationsRequired: iterations,
    };
  }
);

// R2 API Router
const r2Router = new Hono<{ Bindings: Env }>();

// Endpoint to get R2 configuration (list of bound buckets)
r2Router.get("/config", async (c: Context<{ Bindings: Env }>) => {
  console.log("[R2 /config] Handler started.");
  const boundBuckets: { name: string }[] = [];
  const environment = c.env as any; // Cast to any for dynamic key access for this loop

  if (!environment) {
    console.error("[R2 /config] c.env is undefined or null!");
    return c.json({ error: "Server configuration error: environment not available." }, 500);
  }

  console.log("[R2 /config] Iterating environment keys:", Object.keys(environment));

  for (const key in environment) {
    console.log(`[R2 /config] Checking key: ${key}`);
    // Check if the binding is an R2Bucket
    const potentialBucket = environment[key] as R2Bucket;
    if (
      potentialBucket &&
      typeof potentialBucket.get === 'function' &&
      typeof potentialBucket.put === 'function' &&
      typeof potentialBucket.list === 'function' &&
      typeof potentialBucket.delete === 'function'
    ) {
      console.log(`[R2 /config] Key ${key} has R2-like methods.`);
      // Further check to avoid matching other objects with similar methods (e.g. D1, KV)
      // R2 Buckets typically don't have an `execute` or `prepare` method like D1,
      // or a `getWithMetadata` like KV (though KV's `get` is similar).
      // This check is not foolproof but helps reduce false positives.
      // @ts-expect-error - `prepare` and `execute` are not on R2Bucket type but useful for duck-typing
      if (typeof potentialBucket.prepare !== 'function' && typeof potentialBucket.execute !== 'function') {
         console.log(`[R2 /config] Key ${key} does not have D1 methods.`);
        // @ts-expect-error - `getWithMetadata` is not on R2Bucket type
        if (typeof potentialBucket.getWithMetadata !== 'function') {
            console.log(`[R2 /config] Key ${key} does not have KV methods.`);
            // Heuristic: If it looks like an R2 bucket based on its methods, add its binding name.
            // Filter out internal Cloudflare bindings or others that might match.
            // Example: ignore __STATIC_CONTENT_MANIFEST, ASSETS (if it's a KV binding for assets)
            if (!key.startsWith("__") && key !== "ASSETS" && key !== "DB" && key !== "KV" && key !== "AI") {
                 console.log(`[R2 /config] Adding bucket: ${key}`);
                 boundBuckets.push({ name: key });
            }
        }
      }
    }
  }
  console.log("[R2 /config] Final boundBuckets:", JSON.stringify(boundBuckets));
  return c.json({ buckets: boundBuckets });
});

// Endpoint to list objects in a bucket
r2Router.get("/buckets/:bucketName/objects", async (c: Context<{ Bindings: Env }>) => {
  const bucketName = c.req.param("bucketName");
  const bucket = (c.env as any)[bucketName] as R2Bucket;

  if (!bucket || typeof bucket.list !== 'function') {
    return c.json({ error: `Bucket '${bucketName}' not found or is not a valid R2 bucket.` }, 404);
  }

  const prefix = c.req.query("prefix") || undefined;
  const delimiter = c.req.query("delimiter") || undefined;
  const cursor = c.req.query("cursor") || undefined;
  const limitParam = c.req.query("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  try {
    const listOptions: R2ListOptions = {
      prefix,
      delimiter,
      cursor,
      limit,
      // include: ['httpMetadata', 'customMetadata'], // Optional: if you need these
    };
    // Remove undefined keys from options
    Object.keys(listOptions).forEach(key => (listOptions as any)[key] === undefined && delete (listOptions as any)[key]);

    const listed: R2Objects = await bucket.list(listOptions);

    // The R2ListObjectsResponse expects delimited_prefixes, not commonPrefixes.
    // R2 list() result uses `delimitedPrefixes` directly.
    // Handle the conditional cursor property based on the R2Objects type
    const responsePayload: {
      objects: R2Object[];
      truncated: boolean;
      cursor?: string;
      delimited_prefixes: string[];
    } = {
      objects: listed.objects,
      truncated: listed.truncated,
      delimited_prefixes: listed.delimitedPrefixes || [],
    };

    if (listed.truncated && listed.cursor) {
      responsePayload.cursor = listed.cursor;
    }

    return c.json(responsePayload);
  } catch (e: any) {
    console.error(`Error listing objects in bucket ${bucketName}:`, e);
    return c.json({ error: "Failed to list objects", details: e.message }, 500);
  }
});

// Endpoint to upload an object
r2Router.post("/buckets/:bucketName/upload", async (c: Context<{ Bindings: Env }>) => {
  const bucketName = c.req.param("bucketName");
  const bucket = (c.env as any)[bucketName] as R2Bucket;

  if (!bucket || typeof bucket.put !== 'function') {
    return c.json({ error: `Bucket '${bucketName}' not found or is not a valid R2 bucket.` }, 404);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const objectKey = formData.get("objectKey") as string | null;

    if (!file || !objectKey) {
      return c.json({ error: "Missing file or objectKey in form data." }, 400);
    }

    const httpMetadata: R2HTTPMetadata = { contentType: file.type };
    // Add custom metadata if needed, e.g., from formData
    // const customMetadata: Record<string, string> = { uploadedBy: 'dash-agent' };

    // The stream from FormData File.stream() should be compatible.
    // Casting to `any` as a workaround for persistent TypeScript stream type conflicts.
    await bucket.put(objectKey, file.stream() as any, { 
      httpMetadata,
      // customMetadata,
    });

    return c.json({ success: true, message: `File ${objectKey} uploaded to ${bucketName}.` });
  } catch (e: any) {
    console.error(`Error uploading to bucket ${bucketName}:`, e);
    return c.json({ error: "Upload failed", details: e.message }, 500);
  }
});

// Endpoint to delete object(s)
r2Router.post("/buckets/:bucketName/delete", async (c: Context<{ Bindings: Env }>) => {
  const bucketName = c.req.param("bucketName");
  const bucket = (c.env as any)[bucketName] as R2Bucket;

  if (!bucket || typeof bucket.delete !== 'function') {
    return c.json({ error: `Bucket '${bucketName}' not found or is not a valid R2 bucket.` }, 404);
  }

  try {
    const { objectKeys } = await c.req.json<{ objectKeys?: string[] }>();
    if (!objectKeys || !Array.isArray(objectKeys) || objectKeys.length === 0) {
      return c.json({ error: "Missing or invalid objectKeys in request body." }, 400);
    }

    await bucket.delete(objectKeys);
    return c.json({ success: true, message: `Objects deleted from ${bucketName}.` });
  } catch (e: any) {
    console.error(`Error deleting from bucket ${bucketName}:`, e);
    return c.json({ error: "Delete failed", details: e.message }, 500);
  }
});

// Endpoint to download an object (matches :objectKey(*))
r2Router.get("/buckets/:bucketName/objects/:objectKey{.*}", async (c: Context<{ Bindings: Env }>) => {
  const bucketName = c.req.param("bucketName");
  const objectKey = c.req.param("objectKey"); // Hono automatically decodes the path parameter
  const bucket = (c.env as any)[bucketName] as R2Bucket;

  if (!bucket || typeof bucket.get !== 'function') {
    return c.json({ error: `Bucket '${bucketName}' not found or is not a valid R2 bucket.` }, 404);
  }

  try {
    const object = await bucket.get(objectKey);

    if (object === null) {
      return c.json({ error: `Object '${objectKey}' not found in bucket '${bucketName}'.` }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers as any);
    headers.set("etag", object.httpEtag);
    // Forcing download by default, can be made conditional
    headers.set("Content-Disposition", `attachment; filename="${objectKey.split('/').pop() || objectKey}"`);

    // Convert global Headers to a Record<string, string> for HeadersInit compatibility
    const responseHeaders: Record<string, string> = {};
    // Standard Headers.entries() should be available on global Headers.
    // Cast to 'any' if TypeScript's resolved global Headers type is incomplete.
    for (const [key, value] of (headers as any).entries()) { 
      responseHeaders[key] = value;
    }

    return new Response(object.body as any, { headers: responseHeaders }); // Cast body to any for Response constructor

  } catch (e: any) {
    console.error(`Error downloading object ${objectKey} from ${bucketName}:`, e);
    return c.json({ error: "Download failed", details: e.message }, 500);
  }
});

// Endpoint to create a folder (placeholder object)
r2Router.post("/buckets/:bucketName/folders", async (c: Context<{ Bindings: Env }>) => {
  const bucketName = c.req.param("bucketName");
  const bucket = (c.env as any)[bucketName] as R2Bucket;

  if (!bucket || typeof bucket.put !== 'function') {
    return c.json({ error: `Bucket '${bucketName}' not found or is not a valid R2 bucket.` }, 404);
  }

  try {
    const { path } = await c.req.json<{ path?: string }>();
    if (!path || !path.endsWith('/')) {
      return c.json({ error: "Invalid folder path. It must end with a '/'." }, 400);
    }

    // Create a zero-byte placeholder object. 
    // Using a common name like ".empty" or simply relying on the trailing slash for listing.
    // For this implementation, we ensure the frontend expects paths ending with "/" to be folders.
    // If a placeholder object is strictly needed for some backend logic, it can be created here.
    // For many S3-like systems (including R2), a folder effectively exists if objects are prefixed with its path.
    // Creating an explicit empty object for the folder is a common convention.
    // const placeholderKey = `${path}.r2keep`; // Example placeholder, use path itself for simplicity if allowed

    await bucket.put(path, null); // Create a zero-byte object at the folder path itself to signify existence.

    return c.json({ success: true, message: `Folder '${path}' created in ${bucketName}.` });
  } catch (e: any) {
    console.error(`Error creating folder in bucket ${bucketName}:`, e);
    return c.json({ error: "Folder creation failed", details: e.message }, 500);
  }
});

const authRouter = new Hono<HonoContext>();

authRouter.post('/signup', async (c) => {
  const body: { email?: string; password?: string } = await c.req.json();
  if (!body.email || !body.password) {
    return c.json({ error: "Missing email or password" }, 400);
  }
  const db = c.get('db');
  const { userId } = await auth.createUser(db, body.email!, body.password!);
  const ipAddress = c.req.header("cf-connecting-ip");
  const userAgent = c.req.header("user-agent");
  const sessionToken = await auth.createSession(db, userId, ipAddress, userAgent);
  
  c.header("Set-Cookie", `auth-token=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.mulls.io; Max-Age=${60 * 60 * 24 * 30}`);
  return c.json({ success: true, userId });
});

authRouter.post('/login', async (c) => {
  const body: { email?: string; password?: string } = await c.req.json();
  if (!body.email || !body.password) {
    return c.json({ error: "Missing email or password" }, 400);
  }
  const db = c.get('db');
  const ipAddress = c.req.header("cf-connecting-ip");
  const userAgent = c.req.header("user-agent");
  const { token } = await auth.loginUser(db, body.email!, body.password!, ipAddress, userAgent);
  
  c.header("Set-Cookie", `auth-token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.mulls.io; Max-Age=${60 * 60 * 24 * 30}`);
  return c.json({ success: true });
});

authRouter.post('/logout', (c) => {
  c.header("Set-Cookie", `auth-token=; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.mulls.io; Max-Age=0`);
  return c.json({ success: true });
});

authRouter.get('/session', async (c) => {
  const authToken = getCookie(c, 'auth-token');
  if (!authToken) {
    return c.json({ authenticated: false });
  }
  const db = c.get('db');
  const session = await auth.verifySession(db, authToken);
  if (!session) {
    return c.json({ authenticated: false });
  }
  const user = await db
    .selectFrom("user")
    .where("id", "=", session.userId)
    .select(["id", "email", "name", "image"])
    .executeTakeFirst();
    
  return c.json({ authenticated: true, user });
});

app.route('/api/auth', authRouter);
app.route('/api/r2', r2Router);

app.post('/api/save-conversation', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }
    const db = c.get('db');
    const payload: {
      agentName?: string;
      messages?: Message[];
      userName?: string;
    } = await c.req.json();

    if (!payload.agentName || !Array.isArray(payload.messages) || payload.messages.length === 0) {
      return c.json({ success: false, message: "Invalid request payload: agentName and messages are required." }, 400);
    }
    
    const { id: userId } = user;
    const { agentName, messages } = payload;
    const now = new Date().toISOString();

    let userNameToSave = payload.userName;
    if (!userNameToSave) {
        const userRecord = await db.selectFrom("user").where("id", "=", userId).select("name").executeTakeFirst();
        if (userRecord?.name) {
            userNameToSave = userRecord.name;
        }
    }

    let conversationStartTimestamp = now;
    if (messages[0]?.createdAt) {
      if (typeof messages[0].createdAt === "string") {
        conversationStartTimestamp = messages[0].createdAt;
      } else if (messages[0].createdAt instanceof Date) {
        conversationStartTimestamp = messages[0].createdAt.toISOString();
      }
    }
    
    const sessionInfo = await auth.verifySession(db, getCookie(c, 'auth-token')!);

    const conversationData: UserConversationsTable = {
      id: uuidv4(),
      createdAt: now,
      userId,
      userName: userNameToSave || null,
      agentName,
      sessionId: sessionInfo!.sessionId,
      sessionIpAddress: c.req.header("cf-connecting-ip") || null,
      sessionUserAgent: c.req.header("user-agent") || null,
      conversationStart: conversationStartTimestamp,
      lastSaved: now,
      messageCount: messages.length,
      messages_json: JSON.stringify(messages),
    };

    await db.insertInto("user_conversations").values(conversationData).execute();

    return c.json({ success: true, message: "Conversation saved successfully!", conversationId: conversationData.id });
});

app.get('/api/get-conversations', authMiddleware, async (c) => {
    const authToken = getCookie(c, 'auth-token');
    if (!c.env.SITE_URL) {
      console.error("SITE_URL environment variable not set");
      return c.json({ error: "Server configuration error" }, 500);
    }
    return handleGetConversations(c.req.raw, { ...c.env, SITE_URL: c.env.SITE_URL }, authToken || null);
});

app.get('/images/*', async (c) => {
    return handleImageServing(c.req.raw, new URL(c.req.url), c.env);
});

app.post('/api/generate-image', async (c) => {
    const body = await c.req.json();
    const result = await generateImageAction(body as any, c.env);
    return c.json(result, result.success ? 200 : 400);
});

app.post('/api/generate-image-openai', async (c) => {
    const body = await c.req.json() as { prompt: string; n: number; size: string; quality: string; output_compression?: number; };
    const result = await generateImageOpenAIFromFrontendAction(body, c.env);
    return c.json(result, result.success ? 200 : 400);
});

app.post('/api/edit-image', async (c) => {
    const body = await c.req.json();
    const result = await editImageAction(body as any, c.env);
    return c.json(result, result.success ? 200 : 400);
});

app.post('/api/save-generated-image', async (c) => {
    const body = await c.req.json();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const result = await saveImageAction(body.imageUrls, body.prompt, c.env);
    return c.json(result);
});

// Video generation routes
app.post('/api/generate-video', authMiddleware, async (c) => {
  const body = await c.req.json();
  const result = await startVideoGeneration(body as any, c.env, c.req.raw);
  return c.json(result);
});

app.get('/api/video-jobs', authMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const result = await getUserVideoJobs(c.env, c.req.raw, limit, offset);
  return c.json(result);
});

app.get('/api/video-jobs/:jobId', authMiddleware, async (c) => {
  const jobId = c.req.param('jobId');
  const result = await getVideoJobStatus(jobId, c.env, c.req.raw, c.executionCtx);
  return c.json(result);
});

app.post('/api/video-jobs/:jobId/cancel', authMiddleware, async (c) => {
  const jobId = c.req.param('jobId');
  const result = await cancelVideoJob(jobId, c.env, c.req.raw);
  return c.json(result);
});

// Kling video generation routes
app.post('/api/generate-kling-video', authMiddleware, async (c) => {
  const body = await c.req.json();
  const result = await startKlingVideoGeneration(body as any, c.env, c.req.raw);
  return c.json(result);
});

app.get('/api/kling-video-jobs', authMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const result = await getUserKlingVideoJobs(c.env, c.req.raw, limit, offset);
  return c.json(result);
});

app.get('/api/kling-video-jobs/:jobId', authMiddleware, async (c) => {
  const jobId = c.req.param('jobId');
  const result = await getKlingVideoJobStatus(jobId, c.env, c.req.raw, c.executionCtx);
  return c.json(result);
});

app.post('/api/kling-video-jobs/:jobId/cancel', authMiddleware, async (c) => {
  const jobId = c.req.param('jobId');
  const result = await cancelKlingVideoJob(jobId, c.env, c.req.raw);
  return c.json(result);
});

// Google video generation routes
app.post('/api/generate-video-google', authMiddleware, async (c) => {
  const { POST } = await import('./api/generate-video-google');
  return POST(c.req.raw, c.env);
});

app.get('/api/google-video-jobs', authMiddleware, async (c) => {
  const { GET } = await import('./api/google-video-jobs');
  return GET(c.req.raw, c.env);
});

app.get('/api/google-video-jobs/:jobId', authMiddleware, async (c) => {
  const jobId = c.req.param('jobId');
  const { getJobStatus } = await import('./api/google-video-jobs');
  return getJobStatus(jobId, c.env, c.req.raw, c.executionCtx);
});

// Helper for itty-router style handlers
const ittyRouterHandler = (handler: { fetch: Function }) => async (c: Context<HonoContext>) => {
    let request = c.req.raw;
    const authToken = getCookie(c, 'auth-token');
    if (authToken && !request.headers.get("Cookie")?.includes("auth-token")) {
        request = new Request(request.url, request);
        request.headers.set("Cookie", `auth-token=${authToken}`);
    }
    return handler.fetch(request, c.env, c.executionCtx);
};

app.all('/api/save-code', ittyRouterHandler(saveCodeHandler));
app.use('/api/profile/*', authMiddleware);
app.route('/api/profile', profileRouter);
app.use('/api/teams/*', authMiddleware);
app.route('/api/teams', teamsRouter);
app.use('/api/files/*', authMiddleware);
app.route('/api/files', filesRouter);
app.use('/api/project/*', authMiddleware);
app.route('/api/project', projectRouter);
app.use('/api/chat/*', authMiddleware);
app.route('/api/chat', chatAPI);

app.all('/api/saved-sessions/*', async (c) => {
    let request = c.req.raw;
    const authToken = getCookie(c, 'auth-token');
    if (authToken && !request.headers.get("Cookie")?.includes("auth-token")) {
        request = new Request(request.url, request);
        request.headers.set("Cookie", `auth-token=${authToken}`);
    }
    return savedSessionsHandler(request, c.env, c.executionCtx as ExecutionContext);
});

app.get('/check-open-ai-key', (c) => {
    return c.json({ success: !!c.env.OPENAI_API_KEY });
});

app.get('/api/cloudflare/*', async (c) => {
    return handleCloudflareRequest(c.req.raw, c.env);
});

const proxyToAssets = async (c: Context<HonoContext>) => {
    if (!c.env.ASSETS_URL) {
        console.error("ASSETS_URL is not defined in environment. Cannot proxy request.");
        return c.json({ error: "Configuration error: ASSETS_URL not set." }, 500);
    }
    const url = new URL(c.req.url);
    console.log(`Proxying request for ${url.pathname} to frontend server at ${c.env.ASSETS_URL}`);
    const assetUrl = `${c.env.ASSETS_URL}${url.pathname}${url.search}`;
    const proxyRequest = new Request(assetUrl, c.req.raw);
    const assetOrigin = new URL(c.env.ASSETS_URL);
    proxyRequest.headers.set("Host", assetOrigin.host);
    return fetch(proxyRequest);
};

const secureProxyAuth = async (c: Context<HonoContext>, next: any) => {
    const authToken = getCookie(c, 'auth-token');
    if (!authToken) {
        const loginUrl = new URL("/login", c.env.SITE_URL!);
        return c.redirect(loginUrl.toString(), 302);
    }
    const db = c.get('db');
    const session = await auth.verifySession(db, authToken);
    if (!session) {
        const loginUrl = new URL("/login", c.env.SITE_URL!);
        return c.redirect(loginUrl.toString(), 302);
    }
    await next();
}

app.use('/dashboard/*', secureProxyAuth);
app.use('/admin/*', secureProxyAuth);
app.get('/dashboard/*', proxyToAssets);
app.get('/admin/*', proxyToAssets);

app.notFound(proxyToAssets);

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      if (!env.OPENAI_API_KEY) {
        console.error(
          "OPENAI_API_KEY is not set, don't forget to set it locally in .dev.vars, and use `wrangler secret bulk .dev.vars` to upload it to production"
        );
      }
      return await app.fetch(request, env, ctx);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Global fetch error in src/server.ts:", err);
      const errorResponseHeaders = new Headers({
        "Access-Control-Allow-Origin": env.SITE_URL || "*",
        "Content-Type": "application/json",
      });

      return new Response(
        JSON.stringify({ error: "Internal Server Error", message }),
        {
          status: 500,
          headers: errorResponseHeaders,
        }
      );
    }
  },
} satisfies ExportedHandler<Env>;
