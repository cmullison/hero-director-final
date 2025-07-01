import { D1Database } from "@cloudflare/workers-types";
import { auth } from "../lib/auth";
import type { Env, Database } from "../lib/types";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { v4 as uuidv4 } from "uuid";
import { Hono } from 'hono';

interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  collaboratorsJson: string | null;
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
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
});

/**
 * Get a user's projects by their user ID
 */
async function getProjectsByUserId(
  db: D1Database,
  userId: string
): Promise<Project[] | null> {
  try {
    console.log(`[Project API] Getting projects for user ID: ${userId}`);
    const projects = await db
      .prepare("SELECT * FROM project WHERE userId = ? ORDER BY updatedAt DESC")
      .bind(userId)
      .all<Project>();

    if (projects) {
      console.log(
        `[Project API] Found ${projects.results?.length || 0} projects for user ID: ${userId}`
      );
    } else {
      console.log(`[Project API] No projects found for user ID: ${userId}`);
    }

    return projects.results || null;
  } catch (error) {
    console.error(
      `[Project API] Failed to get projects for user ID ${userId}:`,
      error
    );
    throw new Error(
      `Failed to get projects: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get a specific project by ID and userId
 */
async function getProjectById(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<Project | null> {
  try {
    console.log(
      `[Project API] Getting project ${projectId} for user ID: ${userId}`
    );
    const project = await db
      .prepare("SELECT * FROM project WHERE id = ? AND userId = ?")
      .bind(projectId, userId)
      .first<Project>();

    if (project) {
      console.log(
        `[Project API] Found project ${projectId} for user ID: ${userId}`
      );
    } else {
      console.log(
        `[Project API] No project found with ID ${projectId} for user ID: ${userId}`
      );
    }

    return project || null;
  } catch (error) {
    console.error(
      `[Project API] Failed to get project ${projectId} for user ID ${userId}:`,
      error
    );
    throw new Error(
      `Failed to get project: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Create a new project for a user
 */
async function createProject(
  db: D1Database,
  projectData: {
    userId: string;
    name: string;
    description?: string | null;
    collaboratorsJson?: string | null;
  }
): Promise<Project> {
  try {
    const {
      userId,
      name,
      description = null,
      collaboratorsJson = null,
    } = projectData;

    console.log(`[Project API] Creating new project for user ID: ${userId}`);

    const timestamp = new Date().toISOString();
    const projectId = uuidv4();

    const insertResult = await db
      .prepare(
        `
      INSERT INTO project 
      (id, userId, name, description, collaboratorsJson, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        projectId,
        userId,
        name || "",
        description || null,
        collaboratorsJson || null,
        timestamp,
        timestamp
      )
      .run();

    // Get the created project
    const selectResult = await db
      .prepare(
        `
      SELECT * FROM project WHERE id = ?
    `
      )
      .bind(projectId)
      .first<Project>();

    if (!selectResult) {
      throw new Error(`Failed to create project with ID: ${projectId}`);
    }

    console.log(
      `[Project API] Successfully created project with ID: ${projectId}`
    );
    return selectResult;
  } catch (error) {
    console.error(
      `[Project API] Failed to create project for user ID ${projectData.userId}:`,
      error
    );
    throw new Error(
      `Failed to create project: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Update an existing project
 */
async function updateProject(
  db: D1Database,
  projectData: Project
): Promise<Project> {
  try {
    console.log(
      `[Project API] Updating project for user ID: ${projectData.userId}`
    );

    // Check if project exists
    const existingProject = await db
      .prepare("SELECT * FROM project WHERE id = ? AND userId = ?")
      .bind(projectData.id, projectData.userId)
      .first<Project>();

    if (!existingProject) {
      throw new Error(
        `Project not found or does not belong to user ${projectData.userId}`
      );
    }

    const timestamp = new Date().toISOString();

    // Update project
    await db
      .prepare(
        `
      UPDATE project 
      SET name = ?, description = ?, collaboratorsJson = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `
      )
      .bind(
        projectData.name,
        projectData.description || null,
        projectData.collaboratorsJson || null,
        timestamp,
        projectData.id,
        projectData.userId
      )
      .run();

    // Get the updated project
    const updatedProject = await db
      .prepare("SELECT * FROM project WHERE id = ?")
      .bind(projectData.id)
      .first<Project>();

    if (!updatedProject) {
      throw new Error(
        `Failed to retrieve updated project with ID: ${projectData.id}`
      );
    }

    console.log(
      `[Project API] Successfully updated project with ID: ${projectData.id}`
    );
    return updatedProject;
  } catch (error) {
    console.error(`[Project API] Failed to update project:`, error);
    throw new Error(
      `Failed to update project: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Delete a project
 */
async function deleteProject(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<void> {
  try {
    console.log(
      `[Project API] Deleting project ${projectId} for user ID: ${userId}`
    );

    // Check if project exists
    const existingProject = await db
      .prepare("SELECT * FROM project WHERE id = ? AND userId = ?")
      .bind(projectId, userId)
      .first<Project>();

    if (!existingProject) {
      throw new Error(`Project not found or does not belong to user ${userId}`);
    }

    // Delete the project
    await db
      .prepare("DELETE FROM project WHERE id = ? AND userId = ?")
      .bind(projectId, userId)
      .run();

    console.log(
      `[Project API] Successfully deleted project with ID: ${projectId}`
    );
  } catch (error) {
    console.error(
      `[Project API] Failed to delete project ${projectId} for user ID: ${userId}:`,
      error
    );
    throw new Error(
      `Failed to delete project: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get or create default project for user
 */
async function getOrCreateDefaultProject(
  db: D1Database,
  userId: string
): Promise<Project> {
  try {
    console.log(
      `[Project API] Getting or creating default project for user: ${userId}`
    );

    const projects = await getProjectsByUserId(db, userId);

    if (projects && projects.length > 0) {
      console.log(
        `[Project API] Found existing projects for user: ${userId}, returning first one`
      );
      return projects[0];
    }

    console.log(
      `[Project API] No projects found for user: ${userId}, creating default`
    );
    const defaultProject = await createProject(db, {
      userId,
      name: "Untitled Project",
      description: null,
    });

    return defaultProject;
  } catch (error) {
    console.error(
      `[Project API] Failed to get or create default project for user: ${userId}:`,
      error
    );
    throw new Error(
      `Failed to get or create default project: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

const projectRouter = new Hono<HonoContext>();

projectRouter.get('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    try {
        let projects = await getProjectsByUserId(db, userId);
        if (!projects || projects.length === 0) {
            const defaultProject = await getOrCreateDefaultProject(db, userId);
            projects = [defaultProject];
        }
        return c.json({ success: true, projects });
    } catch (error: any) {
        return c.json({ error: 'Failed to retrieve projects', details: error.message }, 500);
    }
});

projectRouter.post('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    try {
        const data = await c.req.json();
        const newProject = await createProject(db, {
            userId,
            name: data.name || "Untitled Project",
            description: data.description || null,
            collaboratorsJson: data.collaboratorsJson || null,
        });
        return c.json({ success: true, project: newProject }, 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to create project', details: error.message }, 500);
    }
});

projectRouter.get('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const projectId = c.req.param('id');
    try {
        const project = await getProjectById(db, projectId, userId);
        if (!project) {
            return c.json({ error: "Project not found or you do not have permission to access it" }, 404);
        }
        return c.json({ success: true, project });
    } catch (error: any) {
        return c.json({ error: 'Failed to retrieve project', details: error.message }, 500);
    }
});

projectRouter.put('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const projectId = c.req.param('id');
    try {
        const data = await c.req.json();
        data.id = projectId;
        data.userId = userId;
        const updatedProject = await updateProject(db, data as Project);
        return c.json({ success: true, project: updatedProject });
    } catch (error: any) {
        return c.json({ error: 'Failed to update project', details: error.message }, 500);
    }
});

projectRouter.delete('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const projectId = c.req.param('id');
    try {
        await deleteProject(db, projectId, userId);
        return c.json({ success: true, message: `Project ${projectId} deleted successfully` });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete project', details: error.message }, 500);
    }
});

export default projectRouter;
