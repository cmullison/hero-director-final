import { D1Database } from "@cloudflare/workers-types";
import { auth } from "../lib/auth";
import type { Env, Database } from "../lib/types";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { v4 as uuidv4 } from "uuid";
import { Hono } from 'hono';

interface FileItem {
  id: string;
  userId: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  path: string;
  codeBody?: string;
  projectId?: string | null;
  collaboratorsJson?: string | null;
  version?: string | null;
  createdAt: string;
  updatedAt: string;
}

type HonoContext = {
  Bindings: Env;
  Variables: {
    user: { id: string };
  };
};

// Define common CORS headers
const getCorsHeaders = (env: { SITE_URL?: string }) => ({
  "Access-Control-Allow-Origin": env.SITE_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
});

/**
 * Get a user's files by their user ID
 */
async function getFilesByUserId(
  db: D1Database,
  userId: string
): Promise<FileItem[] | null> {
  try {
    console.log(`[File API] Getting files for user ID: ${userId}`);
    const files = await db
      .prepare("SELECT * FROM files WHERE userId = ?")
      .bind(userId)
      .all<FileItem>();

    if (files) {
      console.log(`[File API] Found files for user ID: ${userId}`);
    } else {
      console.log(`[File API] No files found for user ID: ${userId}`);
    }

    return files.results || null;
  } catch (error) {
    console.error(
      `[File API] Failed to get files for user ID ${userId}:`,
      error
    );
    throw new Error(
      `Failed to get files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Ensure the files table exists and has the correct schema
 * This version explicitly avoids any foreign key constraints
 */
/* async function ensureFilesTableExists(db: D1Database): Promise<void> {
  try {
    console.log(`[File API] Ensuring files table exists`);
    await db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        parentId TEXT,
        path TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    console.log(`[File API] Files table exists or was created successfully`);
  } catch (error) {
    console.error(`[File API] Failed to ensure files table exists:`, error);
    throw new Error(`Failed to ensure files table exists: ${error instanceof Error ? error.message : String(error)}`);
  }
} */

/**
 * Delete user files
 */
export async function deleteFiles(
  db: D1Database,
  userId: string
): Promise<void> {
  try {
    console.log(`[File API] Deleting files for user ID: ${userId}`);
    await db.prepare("DELETE FROM files WHERE userId = ?").bind(userId).run();
    console.log(`[File API] Successfully deleted files for user ID: ${userId}`);
  } catch (error) {
    console.error(
      `[File API] Failed to delete files for user ID: ${userId}:`,
      error
    );
    throw new Error(
      `Failed to delete files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get user profile or create a default one if it doesn't exist
 */
export async function getOrCreateFile(
  db: D1Database,
  userId: string,
  existingFile?: Partial<FileItem>
): Promise<FileItem> {
  try {
    console.log(
      `[File API] Attempting to get or create files for user ID: ${userId}`
    );
    const files = await getFilesByUserId(db, userId);

    if (files && files.length > 0) {
      console.log(`[File API] Found existing files for user ID: ${userId}`);
      return files[0];
    }

    console.log(
      `[File API] No existing files found for user ID: ${userId}, creating default`
    );
    // Create a default files
    const newFiles = await createFiles(db, {
      userId,
      name: existingFile?.name || "",
      type: existingFile?.type || "file",
      parentId: existingFile?.parentId || null,
      path: existingFile?.path || "",
    });

    return newFiles[0];
  } catch (error) {
    console.error(
      `[File API] Failed to get or create files for user ID: ${userId}:`,
      error
    );
    throw new Error(
      `Failed to get or create files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Create a new file for a user
 */
async function createFiles(
  db: D1Database,
  fileData: {
    userId: string;
    name: string;
    type?: "file" | "folder";
    parentId?: string | null;
    path?: string;
    codeBody?: string;
    projectId?: string | null;
  }
): Promise<FileItem[]> {
  try {
    const {
      userId,
      name,
      type = "file",
      parentId = null,
      path = "",
      codeBody = "",
      projectId = null,
    } = fileData;

    console.log(`[File API] Creating new file for user ID: ${userId}`);

    // Ensure the files table exists before inserting
    // await ensureFilesTableExists(db);

    const timestamp = new Date().toISOString();
    const fileId = uuidv4();

    // First do a basic INSERT without RETURNING which sometimes triggers foreign key validation
    const insertResult = await db
      .prepare(
        `
      INSERT INTO files 
      (id, userId, name, type, parentId, path, codeBody, projectId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        fileId,
        userId,
        name || "",
        type || "file",
        parentId || null,
        path || "",
        codeBody || "",
        projectId || null,
        timestamp,
        timestamp
      )
      .run();

    // Now do a SELECT to get the full row with RETURNING
    const selectResult = await db
      .prepare(
        `
      SELECT * FROM files WHERE id = ?
    `
      )
      .bind(fileId)
      .all<FileItem>();

    if (selectResult.results.length === 0) {
      throw new Error(`Failed to create file with ID: ${fileId}`);
    }

    const file = selectResult.results;

    console.log(`[File API] Successfully created file with ID: ${fileId}`);
    return file;
  } catch (error) {
    console.error(
      `[File API] Failed to create files for user ID ${fileData.userId}:`,
      error
    );
    throw new Error(
      `Failed to create files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Update a user's files
 */
async function updateFiles(
  db: D1Database,
  fileData: FileItem
): Promise<FileItem> {
  try {
    console.log(`[File API] Updating file for user ID: ${fileData.userId}`);

    // Check if file exists
    const existingFile = await db
      .prepare("SELECT * FROM files WHERE id = ? AND userId = ?")
      .bind(fileData.id, fileData.userId)
      .first<FileItem>();

    if (!existingFile) {
      throw new Error(
        `File not found or does not belong to user ${fileData.userId}`
      );
    }

    const timestamp = new Date().toISOString();

    // Update base file properties
    let updateQuery = `
      UPDATE files 
      SET updatedAt = ?
    `;

    let params: (string | null)[] = [timestamp];

    // Conditionally add fields to update based on what was provided
    if (fileData.name !== undefined) {
      updateQuery += ", name = ?";
      params.push(fileData.name);
    }

    if (fileData.type !== undefined) {
      updateQuery += ", type = ?";
      params.push(fileData.type);
    }

    if (fileData.parentId !== undefined) {
      updateQuery += ", parentId = ?";
      params.push(fileData.parentId);
    }

    if (fileData.path !== undefined) {
      updateQuery += ", path = ?";
      params.push(fileData.path);
    }

    if (fileData.codeBody !== undefined) {
      updateQuery += ", codeBody = ?";
      params.push(fileData.codeBody);
    }

    if (fileData.projectId !== undefined) {
      updateQuery += ", projectId = ?";
      params.push(fileData.projectId);
    }

    if (fileData.collaboratorsJson !== undefined) {
      updateQuery += ", collaboratorsJson = ?";
      params.push(fileData.collaboratorsJson);
    }

    if (fileData.version !== undefined) {
      updateQuery += ", version = ?";
      params.push(fileData.version);
    }

    // Add the WHERE clause and bind the file ID and user ID
    updateQuery += " WHERE id = ? AND userId = ?";
    params.push(fileData.id, fileData.userId);

    // Execute the update query
    await db
      .prepare(updateQuery)
      .bind(...params)
      .run();

    // Get the updated file
    const updatedFile = await db
      .prepare("SELECT * FROM files WHERE id = ?")
      .bind(fileData.id)
      .first<FileItem>();

    if (!updatedFile) {
      throw new Error(
        `Failed to retrieve updated file with ID: ${fileData.id}`
      );
    }

    console.log(`[File API] Successfully updated file with ID: ${fileData.id}`);
    return updatedFile;
  } catch (error) {
    console.error(`[File API] Failed to update file:`, error);
    throw new Error(
      `Failed to update file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

const filesRouter = new Hono<HonoContext>();

// Get all files for a user
filesRouter.get('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    try {
        let files = await getFilesByUserId(db, userId);
        if (!files) {
            files = await createFiles(db, { userId, name: "My Files", type: "folder", codeBody: "-no code for directory type-" });
        }
        return c.json({ success: true, files });
    } catch (error: any) {
        return c.json({ error: 'Failed to retrieve files', details: error.message }, 500);
    }
});

// Create a new file
filesRouter.post('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    try {
        const data = await c.req.json();
        const newFile = await createFiles(db, {
            userId,
            name: data.name || "",
            type: data.type || "file",
            parentId: data.parentId || null,
            path: data.path || "",
            codeBody: data.codeBody || "",
            projectId: data.projectId || null,
        });
        return c.json({ success: true, file: newFile[0] }, 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to create file', details: error.message }, 500);
    }
});

// Get a specific file
filesRouter.get('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const fileId = c.req.param('id');
    try {
        const file = await db
            .prepare("SELECT * FROM files WHERE id = ? AND userId = ?")
            .bind(fileId, userId)
            .first<FileItem>();

        if (!file) {
            return c.json({ error: "File not found or you do not have permission to access it" }, 404);
        }
        return c.json({ success: true, file });
    } catch (error: any) {
        return c.json({ error: 'Failed to retrieve file', details: error.message }, 500);
    }
});

// Update a specific file
filesRouter.put('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const fileId = c.req.param('id');
    try {
        const data = await c.req.json();
        data.id = fileId;
        data.userId = userId;

        const updatedFile = await updateFiles(db, data as FileItem);
        return c.json({ success: true, file: updatedFile });
    } catch (error: any) {
        return c.json({ error: 'Failed to update file', details: error.message }, 500);
    }
});

// Delete a specific file
filesRouter.delete('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const fileId = c.req.param('id');
    try {
        const file = await db
            .prepare("SELECT * FROM files WHERE id = ? AND userId = ?")
            .bind(fileId, userId)
            .first<FileItem>();

        if (!file) {
            return c.json({ error: "File not found or you do not have permission to delete it" }, 404);
        }

        await db
            .prepare("DELETE FROM files WHERE id = ? AND userId = ?")
            .bind(fileId, userId)
            .run();
        
        return c.json({ success: true, message: `File ${fileId} deleted successfully` });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete file', details: error.message }, 500);
    }
});

export default filesRouter;
