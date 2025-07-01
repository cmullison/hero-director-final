import { D1Database } from "@cloudflare/workers-types";
import { auth } from "../lib/auth";
import type { Env, Database } from "../lib/types";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { v4 as uuidv4 } from "uuid";

interface SavedSession {
  id: string;
  user_id: string;
  session_name: string;
  agent_type: string;
  created_at: string;
  last_accessed: string;
  mcp_servers: string; // JSON string
  metadata: string; // JSON string
}

interface SaveSessionRequest {
  sessionName: string;
  agentType: string;
  mcpServers: any[];
  metadata?: any;
}

interface LoadSessionRequest {
  sessionId: string;
}

function getCorsHeaders(env: Env): Record<string, string> {
  const origin = env.SITE_URL || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
  };
}

/**
 * Save a new session
 */
async function saveSession(
  db: D1Database,
  userId: string,
  sessionData: SaveSessionRequest
): Promise<SavedSession> {
  try {
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    const session: SavedSession = {
      id: sessionId,
      user_id: userId,
      session_name: sessionData.sessionName,
      agent_type: sessionData.agentType,
      created_at: now,
      last_accessed: now,
      mcp_servers: JSON.stringify(sessionData.mcpServers || []),
      metadata: JSON.stringify(sessionData.metadata || {}),
    };

    await db
      .prepare(
        `
        INSERT INTO saved_sessions (
          id, user_id, session_name, agent_type, created_at, last_accessed, mcp_servers, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .bind(
        session.id,
        session.user_id,
        session.session_name,
        session.agent_type,
        session.created_at,
        session.last_accessed,
        session.mcp_servers,
        session.metadata
      )
      .run();

    console.log(
      `[Saved Sessions API] Successfully saved session: ${sessionId}`
    );
    return session;
  } catch (error) {
    console.error(`[Saved Sessions API] Failed to save session:`, error);
    throw new Error(
      `Failed to save session: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Load a session by ID
 */
async function loadSession(
  db: D1Database,
  userId: string,
  sessionId: string
): Promise<SavedSession | null> {
  try {
    const result = await db
      .prepare(
        `
        SELECT * FROM saved_sessions 
        WHERE id = ? AND user_id = ?
      `
      )
      .bind(sessionId, userId)
      .first();

    if (!result) {
      return null;
    }

    // Update last_accessed
    await db
      .prepare(
        `
        UPDATE saved_sessions 
        SET last_accessed = ? 
        WHERE id = ? AND user_id = ?
      `
      )
      .bind(new Date().toISOString(), sessionId, userId)
      .run();

    console.log(
      `[Saved Sessions API] Successfully loaded session: ${sessionId}`
    );
    return result as unknown as SavedSession;
  } catch (error) {
    console.error(`[Saved Sessions API] Failed to load session:`, error);
    throw new Error(
      `Failed to load session: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * List all sessions for a user
 */
async function listSessions(
  db: D1Database,
  userId: string
): Promise<SavedSession[]> {
  try {
    const result = await db
      .prepare(
        `
        SELECT * FROM saved_sessions 
        WHERE user_id = ? 
        ORDER BY last_accessed DESC
      `
      )
      .bind(userId)
      .all();

    console.log(
      `[Saved Sessions API] Successfully listed ${result.results.length} sessions for user: ${userId}`
    );
    return result.results as unknown as SavedSession[];
  } catch (error) {
    console.error(`[Saved Sessions API] Failed to list sessions:`, error);
    throw new Error(
      `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Delete a session
 */
async function deleteSession(
  db: D1Database,
  userId: string,
  sessionId: string
): Promise<boolean> {
  try {
    const result = await db
      .prepare(
        `
        DELETE FROM saved_sessions 
        WHERE id = ? AND user_id = ?
      `
      )
      .bind(sessionId, userId)
      .run();

    const deleted = (result as any).changes > 0;
    console.log(
      `[Saved Sessions API] Session deletion result for ${sessionId}: ${deleted}`
    );
    return deleted;
  } catch (error) {
    console.error(`[Saved Sessions API] Failed to delete session:`, error);
    throw new Error(
      `Failed to delete session: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Update session name
 */
async function updateSessionName(
  db: D1Database,
  userId: string,
  sessionId: string,
  newName: string
): Promise<boolean> {
  try {
    const result = await db
      .prepare(
        `
        UPDATE saved_sessions 
        SET session_name = ?, last_accessed = ? 
        WHERE id = ? AND user_id = ?
      `
      )
      .bind(newName, new Date().toISOString(), sessionId, userId)
      .run();

    const updated = (result as any).changes > 0;
    console.log(
      `[Saved Sessions API] Session name update result for ${sessionId}: ${updated}`
    );
    return updated;
  } catch (error) {
    console.error(`[Saved Sessions API] Failed to update session name:`, error);
    throw new Error(
      `Failed to update session name: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Create the saved sessions handler
async function savedSessionsHandler(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  console.log(
    `[Saved Sessions API] Received ${request.method} request to ${request.url}`
  );

  // Setup CORS headers
  const corsHeaders = getCorsHeaders(env);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    console.log(`[Saved Sessions API] Handling OPTIONS request`);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get auth token from cookie
    const cookieHeader = request.headers.get("Cookie") || "";
    const authToken = cookieHeader.match(/auth-token=([^;]+)/)?.[1] || null;
    console.log(
      `[Saved Sessions API] Auth token from cookie: ${authToken ? authToken.substring(0, 6) + "..." : "none"}`
    );

    if (!authToken) {
      console.log(`[Saved Sessions API] Unauthorized: No auth token provided`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Setup DB connection
    if (!env.DB) {
      console.error(
        `[Saved Sessions API] Database not available in environment`
      );
      return new Response(
        JSON.stringify({ error: "Database not configured" }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const db = env.DB;
    console.log(`[Saved Sessions API] Connected to database`);

    // Verify the session using Kysely
    const dbKysely = new Kysely<Database>({
      dialect: new D1Dialect({ database: db }),
    });

    console.log(
      `[Saved Sessions API] Verifying session token: ${authToken.substring(0, 6)}...`
    );
    const session = await auth.verifySession(dbKysely, authToken);

    if (!session) {
      console.log(`[Saved Sessions API] Invalid session token`);
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = session.userId;
    console.log(`[Saved Sessions API] Authenticated user: ${userId}`);

    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const action = pathParts[pathParts.length - 1]; // Get the last part of the path

    switch (request.method) {
      case "GET":
        if (action === "list") {
          // List all sessions for the user
          const sessions = await listSessions(db, userId);
          return new Response(JSON.stringify({ success: true, sessions }), {
            status: 200,
            headers: corsHeaders,
          });
        } else {
          // Load a specific session
          const sessionId = url.searchParams.get("sessionId");
          if (!sessionId) {
            return new Response(
              JSON.stringify({ error: "Session ID required" }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }

          const sessionData = await loadSession(db, userId, sessionId);
          if (!sessionData) {
            return new Response(
              JSON.stringify({ error: "Session not found" }),
              {
                status: 404,
                headers: corsHeaders,
              }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              session: {
                ...sessionData,
                mcp_servers: JSON.parse(sessionData.mcp_servers),
                metadata: JSON.parse(sessionData.metadata),
              },
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
        }

      case "POST":
        if (action === "save") {
          // Save a new session
          const body = (await request.json()) as SaveSessionRequest;

          if (!body.sessionName || !body.agentType) {
            return new Response(
              JSON.stringify({
                error: "Session name and agent type are required",
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }

          const savedSession = await saveSession(db, userId, body);
          return new Response(
            JSON.stringify({ success: true, session: savedSession }),
            {
              status: 201,
              headers: corsHeaders,
            }
          );
        } else if (action === "update-name") {
          // Update session name
          const body = (await request.json()) as {
            sessionId: string;
            newName: string;
          };

          if (!body.sessionId || !body.newName) {
            return new Response(
              JSON.stringify({ error: "Session ID and new name are required" }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }

          const updated = await updateSessionName(
            db,
            userId,
            body.sessionId,
            body.newName
          );
          if (!updated) {
            return new Response(
              JSON.stringify({ error: "Session not found or not updated" }),
              {
                status: 404,
                headers: corsHeaders,
              }
            );
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: corsHeaders,
          });
        }
        break;

      case "DELETE":
        // Delete a session
        const sessionId = url.searchParams.get("sessionId");
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: "Session ID required" }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        const deleted = await deleteSession(db, userId, sessionId);
        if (!deleted) {
          return new Response(JSON.stringify({ error: "Session not found" }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: corsHeaders,
        });

      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: corsHeaders,
        });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(`[Saved Sessions API] Error:`, error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export { savedSessionsHandler };
