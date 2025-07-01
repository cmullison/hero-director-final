import type { Database } from "../lib/types";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { auth } from "../lib/auth";

// Define the structure of a conversation entry we expect to return
interface ConversationEntry {
  id: string;
  agentName: string;
  userName?: string | null;
  conversationStart: string;
  lastSaved: string;
  messageCount: number;
  firstMessage?: string;
}

// Define common CORS headers
const getCorsHeaders = (env: { SITE_URL: string }) => ({
  "Access-Control-Allow-Origin": env.SITE_URL,
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
});

export async function handleGetConversations(
  request: Request,
  env: { DB: D1Database; SITE_URL: string; [key: string]: any },
  authToken: string | null
): Promise<Response> {
  console.log("[getConversations] Received request");
  const corsHeaders = getCorsHeaders(env);

  if (request.method !== "GET") {
    console.warn("[getConversations] Method Not Allowed:", request.method);
    return new Response(
      JSON.stringify({ success: false, message: "Method Not Allowed" }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  try {
    console.log("[getConversations] Attempting authentication");
    if (!authToken) {
      console.warn(
        "[getConversations] Authentication required: No auth-token provided"
      );
      return new Response(
        JSON.stringify({ success: false, message: "Authentication required" }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: env.DB }),
    });

    const sessionInfo = await auth.verifySession(db, authToken);
    if (!sessionInfo) {
      console.warn("[getConversations] Invalid or expired session.");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid or expired session",
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
    console.log(
      "[getConversations] Session verified for userId:",
      sessionInfo.userId
    );

    const userId = sessionInfo.userId;

    // Parse pagination parameters from URL
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    // Limit the maximum page size to prevent abusive queries
    const safeLimitValue = Math.min(Math.max(1, limit), 100);
    const safeOffsetValue = Math.max(0, offset);

    console.log(
      `[getConversations] Fetching conversations for userId: ${userId}, limit: ${safeLimitValue}, offset: ${safeOffsetValue}`
    );

    // Get total count first
    const totalCountResult = await db
      .selectFrom("user_conversations")
      .select(db.fn.count("id").as("count"))
      .where("userId", "=", userId)
      .executeTakeFirst();

    const totalCount = totalCountResult ? Number(totalCountResult.count) : 0;

    // Then get the paginated results
    const conversationsResult = await db
      .selectFrom("user_conversations")
      .select([
        "id",
        "agentName",
        "userName",
        "conversationStart",
        "lastSaved",
        "messageCount",
        "messages_json",
      ])
      .where("userId", "=", userId)
      .orderBy("lastSaved", "desc")
      .limit(safeLimitValue)
      .offset(safeOffsetValue)
      .execute();

    const conversations: ConversationEntry[] = conversationsResult.map(
      (convo) => {
        if (
          typeof convo.conversationStart === "undefined" ||
          typeof convo.lastSaved === "undefined"
        ) {
          console.error(
            "[getConversations] Unexpected data format from DB:",
            convo
          );
          throw new Error("Unexpected data format for conversation dates.");
        }

        // Extract first message if available
        let firstMessage: string | undefined = undefined;
        if (convo.messages_json) {
          try {
            const messages = JSON.parse(convo.messages_json);
            if (messages && messages.length > 0 && messages[0].content) {
              firstMessage = messages[0].content;
            }
          } catch (err) {
            console.error(
              "[getConversations] Error parsing messages JSON:",
              err
            );
          }
        }

        return {
          id: convo.id,
          agentName: convo.agentName,
          userName: convo.userName,
          conversationStart: new Date(convo.conversationStart).toISOString(),
          lastSaved: new Date(convo.lastSaved).toISOString(),
          messageCount: convo.messageCount,
          firstMessage,
        };
      }
    );

    console.log(
      `[getConversations] Found ${conversations.length} conversations for userId: ${userId} (total: ${totalCount})`
    );
    return new Response(
      JSON.stringify({
        success: true,
        conversations,
        totalCount,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error(
      "[getConversations] Uncaught error:",
      errorMessage,
      errorStack
    );
    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage || "Internal server error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
