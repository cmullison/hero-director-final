import { v4 as uuidv4 } from "uuid"; // You may need to install uuid: npm install uuid @types/uuid

// Import database types and Kysely
import type { Database } from "../lib/types";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

// Import the auth module
import { auth } from "../lib/auth";

// Assume your environment bindings are available in the `env` object
// and that your D1 binding is named `DB`
// Also assume user and session info are attached to the request or available via context

interface ConversationMessage {
  // Define the structure of your messages based on @ai-sdk/react Message type
  // This is a simplified example; adjust according to your actual Message type
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  createdAt?: string; // Assuming messages might have a timestamp
  // Add other relevant properties from your Message type
}

interface SaveConversationPayload {
  agentName: string;
  userName?: string;
  messages: ConversationMessage[];
}

// Define common CORS headers to be used in responses from this function
const getCorsHeaders = (env: { SITE_URL: string }) => ({
  "Access-Control-Allow-Origin": env.SITE_URL,
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
});

// This function would typically be part of your Worker's router
// e.g., router.post('/api/save-conversation', handleSaveConversation);
export async function handleSaveConversation(
  request: Request,
  env: { DB: D1Database; SITE_URL: string; [key: string]: any },
  authToken: string | null
): Promise<Response> {
  console.log("[saveConversation] Received request");
  const corsHeaders = getCorsHeaders(env);

  if (request.method !== "POST") {
    console.warn("[saveConversation] Method Not Allowed:", request.method);
    return new Response(
      JSON.stringify({ success: false, message: "Method Not Allowed" }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  try {
    const payload: SaveConversationPayload = await request.json();
    // Be careful logging entire payload if messages can be very large or sensitive
    console.log("[saveConversation] Parsed payload (metadata):", {
      agentName: payload.agentName,
      userName: payload.userName,
      messageCount: payload.messages?.length,
    });

    if (!payload || !payload.agentName || !Array.isArray(payload.messages)) {
      console.warn("[saveConversation] Invalid request payload structure.");
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request payload" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (payload.messages.length === 0) {
      console.warn("[saveConversation] No messages to save.");
      return new Response(
        JSON.stringify({ success: false, message: "No messages to save" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // --- Authenticate User and Get Session Info ---
    console.log("[saveConversation] Attempting authentication");

    if (!authToken) {
      console.warn(
        "[saveConversation] Authentication required: No auth-token provided directly"
      );
      return new Response(
        JSON.stringify({ success: false, message: "Authentication required" }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
    console.log("[saveConversation] Auth token found, verifying...");

    const db = new Kysely<Database>({
      // Kysely instance for auth.verifySession and user lookup
      dialect: new D1Dialect({ database: env.DB }),
    });

    // Assuming verifySession is updated to return { userId: string, sessionId: string } | null
    const sessionInfo = await auth.verifySession(db, authToken);

    if (!sessionInfo) {
      console.warn(
        "[saveConversation] Invalid or expired session for token:",
        authToken ? authToken.substring(0, 6) + "..." : "N/A"
      );
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
    // Log only necessary parts of sessionInfo
    console.log("[saveConversation] Session verified:", {
      userId: sessionInfo.userId,
      sessionId: sessionInfo.sessionId,
    });

    const userId = sessionInfo.userId;
    const actualSessionId = sessionInfo.sessionId; // Use the actual session ID from verifySession

    // Fetch userName from DB for consistency, fallback to payload or placeholder
    let userNameToSave = payload.userName; // From agent.tsx (user?.name)
    try {
      const userRecord = await db
        .selectFrom("user")
        .where("id", "=", userId)
        .select("name")
        .executeTakeFirst();
      if (userRecord && userRecord.name) {
        userNameToSave = userRecord.name;
        console.log(
          `[saveConversation] Fetched userName from DB for userId ${userId}: ${userNameToSave}`
        );
      } else if (payload.userName) {
        console.log(
          `[saveConversation] Using userName from payload: ${payload.userName}`
        );
        userNameToSave = payload.userName;
      } else {
        userNameToSave = "Authenticated User"; // Fallback if not in DB and not in payload
        console.log(
          `[saveConversation] userName not in DB or payload for userId ${userId}, using placeholder: ${userNameToSave}`
        );
      }
    } catch (dbError) {
      console.error(
        `[saveConversation] Error fetching userName for userId ${userId}:`,
        dbError
      );
      userNameToSave = payload.userName || "Authenticated User"; // Fallback on error
    }

    const agentName = payload.agentName;
    const sessionIpAddress = request.headers.get("cf-connecting-ip") || null;
    const sessionUserAgent = request.headers.get("user-agent") || null;

    const conversationId = uuidv4();
    const createdAt = new Date().toISOString();
    const lastSaved = createdAt;

    // Transform message content to use relative R2 image paths
    const imageRegex =
      /(https?:\/\/[^\\s/]+\/)(?:agent-uploads_)?([a-zA-Z0-9_.-]+?\\.(?:png|jpe?g|gif|webp|avif|svg))/gi;
    const transformedMessages = payload.messages.map((message) => {
      // Assuming message.content is always a string as per ConversationMessage interface
      // If content could be structured (e.g., array of parts), this would need adjustment
      const newContent = message.content.replace(imageRegex, "/images/$2");
      return { ...message, content: newContent };
    });

    const messageCount = transformedMessages.length;
    const conversationStart =
      transformedMessages.length > 0
        ? transformedMessages[0].createdAt || createdAt
        : createdAt;
    const messagesJson = JSON.stringify(transformedMessages);

    const conversationData = {
      id: conversationId,
      createdAt,
      userId,
      userName: userNameToSave,
      agentName,
      sessionId: actualSessionId, // Use the correct session ID here
      sessionIpAddress,
      sessionUserAgent,
      conversationStart,
      lastSaved,
      messageCount,
      messages_json: messagesJson,
    };
    console.log("[saveConversation] Prepared conversation data for DB:", {
      ...conversationData,
      messages_json: "...",
    }); // Avoid logging all messages

    // --- Save to D1 ---
    // Note: env.DB is D1Database, not Kysely instance for the stmt.
    const stmt = env.DB.prepare(
      `INSERT INTO user_conversations (
        id, createdAt, userId, userName, agentName, sessionId,
        sessionIpAddress, sessionUserAgent, conversationStart, lastSaved, messageCount, messages_json
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
    ).bind(...Object.values(conversationData));

    console.log(
      "[saveConversation] Executing DB insert for conversation ID:",
      conversationId
    );
    const result = await stmt.run();

    if (result.error) {
      console.error(
        "[saveConversation] D1 Error saving conversation:",
        result.error,
        "For ID:",
        conversationId
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: `Database error: ${result.error}`,
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log(
      "[saveConversation] Conversation saved successfully! ID:",
      conversationId
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Conversation saved successfully!",
        conversationId,
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
      "[saveConversation] Uncaught error handling save conversation request:",
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
        headers: getCorsHeaders(env), // Use getCorsHeaders here too for safety
      }
    );
  }
}
