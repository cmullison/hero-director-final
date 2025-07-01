import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { env } from "cloudflare:workers"; // Import env
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const openaiApiKey = (env as any).OPENAI_API_KEY || "";
const openaiBaseURL = (env as any).OPENAI_BASE_URL;

const openai = createOpenAI({
  apiKey: openaiApiKey,
  baseURL: openaiBaseURL,
});


export const model = openai("gpt-4.1");

const anthropicApiKey = (env as any).ANTHROPIC_API_KEY || "";
const anthropicBaseURL = (env as any).ANTHROPIC_BASE_URL;

const anthropic = createAnthropic({
  apiKey: anthropicApiKey,
  baseURL: anthropicBaseURL,
});

export const anthropicModel = anthropic("claude-sonnet-4-20250514");
export const anthropicOpusModel = anthropic("claude-opus-4-20250514");

const geminiApiKey = (env as any).GOOGLE_GENERATIVE_AI_API_KEY || "";
const geminiBaseURL = (env as any).GOOGLE_BASE_URL;

const google = createGoogleGenerativeAI({
  apiKey: geminiApiKey,
  baseURL: geminiBaseURL,
});

export const geminiModel = google("gemini-2.5-pro");