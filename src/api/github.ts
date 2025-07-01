import { Hono } from "hono";
import { D1Database } from "@cloudflare/workers-types";
import { auth } from "../lib/auth";
import { GitHubService } from "../lib/github";
import type { Env, Database, GitHubIntegrationTable, GitHubRepositoryTable } from "../lib/types";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { v4 as uuidv4 } from "uuid";

type HonoContext = {
  Bindings: Env;
  Variables: {
    user: { id: string };
  };
};

// Define common CORS headers
const getCorsHeaders = (env: { SITE_URL?: string }) => ({
  "Access-Control-Allow-Origin": env.SITE_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
});

const app = new Hono<HonoContext>();

// CORS middleware
app.use("*", async (c, next) => {
  const corsHeaders = getCorsHeaders(c.env);
  
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  await next();
  
  // Add CORS headers to response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    c.res.headers.set(key, value);
  });
});

// Auth middleware
app.use("*", async (c, next) => {
  // Skip auth for OPTIONS requests
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }

  // Get auth token from cookie
  const cookieHeader = c.req.header("Cookie") || "";
  const authToken = cookieHeader.match(/auth-token=([^;]+)/)?.[1] || null;
  
  if (!authToken) {
    return c.json({ error: "Authorization required" }, 401);
  }

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: c.env.DB }),
  });

  const session = await auth.verifySession(db, authToken);
  if (!session) {
    return c.json({ error: "Invalid session" }, 401);
  }

  c.set("user", { id: session.userId });
  await next();
});

/**
 * Start GitHub OAuth flow
 */
app.get("/oauth/github", async (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const redirectUri = c.env.GITHUB_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return c.json({ error: "GitHub OAuth not configured" }, 400);
  }

  const state = crypto.randomUUID();
  const scope = "repo,user:email,read:user";
  
  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);
  
  return c.json({
    authUrl: authUrl.toString(),
    state,
  });
});

/**
 * Handle GitHub OAuth callback
 */
app.post("/oauth/github/callback", async (c) => {
  try {
    const { code, state } = await c.req.json();
    const user = c.get("user");
    
    if (!code) {
      return c.json({ error: "Authorization code required" }, 400);
    }

    const clientId = c.env.GITHUB_CLIENT_ID;
    const clientSecret = c.env.GITHUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return c.json({ error: "GitHub OAuth not configured" }, 400);
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };
    
    if (tokenData.error) {
      return c.json({ error: tokenData.error_description || "Failed to get access token" }, 400);
    }

    if (!tokenData.access_token) {
      return c.json({ error: "No access token received" }, 400);
    }

    const { access_token, token_type, scope } = tokenData;

    // Get GitHub user info
    const githubService = new GitHubService(access_token);
    const githubUser = await githubService.getUser();

    // Store GitHub integration in database
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const timestamp = new Date().toISOString();
    const integrationId = uuidv4();

    // Check if integration already exists
    const existingIntegration = await db
      .selectFrom("github_integration")
      .select(["id", "userId", "githubUserId"])
      .where("userId", "=", user.id)
      .where("githubUserId", "=", githubUser.id.toString())
      .executeTakeFirst();

    if (existingIntegration) {
      // Update existing integration
      await db
                 .updateTable("github_integration")
         .set({
           accessToken: access_token,
           scope: scope || "",
           tokenType: token_type || "bearer",
           updatedAt: timestamp,
           isActive: true,
         })
        .where("id", "=", existingIntegration.id)
        .execute();
    } else {
      // Create new integration
      await db
        .insertInto("github_integration")
        .values({
          id: integrationId,
          userId: user.id,
          githubUserId: githubUser.id.toString(),
          githubUsername: githubUser.login,
          accessToken: access_token,
          refreshToken: null,
          scope: scope || "",
          tokenType: token_type || "bearer",
          createdAt: timestamp,
          updatedAt: timestamp,
          isActive: true,
        })
        .execute();
    }

    return c.json({
      success: true,
      user: githubUser,
      scope,
    });
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return c.json({ error: "Failed to complete GitHub authorization" }, 500);
  }
});

/**
 * Get GitHub integration status
 */
app.get("/integration", async (c) => {
  try {
    const user = c.get("user");
    
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select([
        "id",
        "githubUserId",
        "githubUsername",
        "scope",
        "createdAt",
        "updatedAt",
      ])
      .executeTakeFirst();

    return c.json({
      connected: !!integration,
      integration: integration || null,
    });
  } catch (error) {
    console.error("Error checking GitHub integration:", error);
    return c.json({ error: "Failed to check GitHub integration" }, 500);
  }
});

/**
 * Disconnect GitHub integration
 */
app.delete("/integration", async (c) => {
  try {
    const user = c.get("user");
    
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    await db
      .updateTable("github_integration")
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where("userId", "=", user.id)
      .execute();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting GitHub integration:", error);
    return c.json({ error: "Failed to disconnect GitHub integration" }, 500);
  }
});

/**
 * Get repositories
 */
app.get("/repositories", async (c) => {
  try {
    const user = c.get("user");
    const page = parseInt(c.req.query("page") || "1");
    const perPage = parseInt(c.req.query("per_page") || "30");
    
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    const repositories = await githubService.getRepositories(page, perPage);

    return c.json({ repositories });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return c.json({ error: "Failed to fetch repositories" }, 500);
  }
});

/**
 * Get branches for a repository
 */
app.get("/repositories/:owner/:repo/branches", async (c) => {
  try {
    const user = c.get("user");
    const { owner, repo } = c.req.param();
    
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    const branches = await githubService.getBranches(owner, repo);

    return c.json({ branches });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return c.json({ error: "Failed to fetch branches" }, 500);
  }
});

/**
 * Get directory contents
 */
app.get("/repositories/:owner/:repo/tree/*", async (c) => {
  try {
    const user = c.get("user");
    const { owner, repo } = c.req.param();
    
    // Parse the path from the URL
    const url = c.req.url;
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const treeMatch = pathname.match(/\/tree\/(.*)$/);
    const path = treeMatch ? decodeURIComponent(treeMatch[1]) : "";
    
    const ref = c.req.query("ref");
    
    console.log(`[API] Tree endpoint called: owner=${owner}, repo=${repo}, path="${path}", ref=${ref}, pathname=${pathname}`);
    
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    const contents = await githubService.getDirectoryContents(owner, repo, path, ref);

    console.log(`[API] Returning ${contents.length} items for path "${path}"`);
    
    return c.json({ contents });
  } catch (error) {
    console.error("Error fetching directory contents:", error);
    return c.json({ error: "Failed to fetch directory contents" }, 500);
  }
});

/**
 * Create a new branch
 */
app.post("/repositories/:owner/:repo/branches", async (c) => {
  try {
    const user = c.get("user");
    const { owner, repo } = c.req.param();
    const { branchName, fromBranch } = await c.req.json();
    
    if (!branchName || !fromBranch) {
      return c.json({ error: "Branch name and source branch required" }, 400);
    }

    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    
    // Get the SHA of the source branch
    const branches = await githubService.getBranches(owner, repo);
    const sourceBranch = branches.find(b => b.name === fromBranch);
    
    if (!sourceBranch) {
      return c.json({ error: "Source branch not found" }, 404);
    }

    await githubService.createBranch(owner, repo, branchName, sourceBranch.commit.sha);

    return c.json({ success: true, branchName, fromSha: sourceBranch.commit.sha });
  } catch (error) {
    console.error("Error creating branch:", error);
    return c.json({ error: "Failed to create branch" }, 500);
  }
});

/**
 * Get file content
 */
app.get("/repositories/:owner/:repo/contents/*", async (c) => {
  try {
    const user = c.get("user");
    const { owner, repo } = c.req.param();
    
    // Parse the path from the URL
    const url = c.req.url;
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const contentsMatch = pathname.match(/\/contents\/(.*)$/);
    const path = contentsMatch ? decodeURIComponent(contentsMatch[1]) : "";
    
    const ref = c.req.query("ref");
    
    console.log(`[API] File content endpoint called: owner=${owner}, repo=${repo}, path="${path}", ref=${ref}, pathname=${pathname}`);
    
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    const fileContent = await githubService.getFileContent(owner, repo, path, ref);

    console.log(`[API] File content retrieved: path="${path}", sha="${fileContent.sha}", content length=${fileContent.content.length}`);

    return c.json({ 
      content: fileContent.content,
      sha: fileContent.sha,
      path,
    });
  } catch (error) {
    console.error("Error fetching file content:", error);
    return c.json({ error: "Failed to fetch file content" }, 500);
  }
});

/**
 * Create or update file
 */
app.put("/repositories/:owner/:repo/contents/*", async (c) => {
  try {
    const user = c.get("user");
    const { owner, repo } = c.req.param();
    const path = c.req.param("*") || "";
    const { content, message, branch, sha } = await c.req.json();
    
    if (!content || !message) {
      return c.json({ error: "Content and commit message required" }, 400);
    }

    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    await githubService.createOrUpdateFile(owner, repo, path, content, message, branch, sha);

    return c.json({ success: true, path, message });
  } catch (error) {
    console.error("Error creating/updating file:", error);
    return c.json({ error: "Failed to create or update file" }, 500);
  }
});

/**
 * Create pull request
 */
app.post("/repositories/:owner/:repo/pulls", async (c) => {
  try {
    const user = c.get("user");
    const { owner, repo } = c.req.param();
    const { title, head, base, body } = await c.req.json();
    
    if (!title || !head || !base) {
      return c.json({ error: "Title, head branch, and base branch required" }, 400);
    }

    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    const pullRequest = await githubService.createPullRequest(owner, repo, title, head, base, body);

    return c.json({ pullRequest });
  } catch (error) {
    console.error("Error creating pull request:", error);
    return c.json({ error: "Failed to create pull request" }, 500);
  }
});

/**
 * Get pull requests
 */
app.get("/repositories/:owner/:repo/pulls", async (c) => {
  try {
    const user = c.get("user");
    const { owner, repo } = c.req.param();
    const state = c.req.query("state") as 'open' | 'closed' | 'all' || 'open';
    
    const db = new Kysely<Database>({
      dialect: new D1Dialect({ database: c.env.DB }),
    });

    const integration = await db
      .selectFrom("github_integration")
      .where("userId", "=", user.id)
      .where("isActive", "=", true)
      .select(["accessToken"])
      .executeTakeFirst();

    if (!integration) {
      return c.json({ error: "GitHub not connected" }, 400);
    }

    const githubService = new GitHubService(integration.accessToken);
    const pullRequests = await githubService.getPullRequests(owner, repo, state);

    return c.json({ pullRequests });
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    return c.json({ error: "Failed to fetch pull requests" }, 500);
  }
});

export default app; 