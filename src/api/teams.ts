import { D1Database } from "@cloudflare/workers-types";
import type { Env, Database } from "../lib/types";
import { Hono } from 'hono';

export interface Team {
  id?: number;
  name: string;
  owner_id: string;
  image_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id?: number;
  team_id: number;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at?: string;
}

export interface TeamWithRole extends Team {
  user_role: string;
  member_count?: number;
}

type HonoContext = {
  Bindings: Env;
  Variables: {
    user: { id: string };
  };
};

/**
 * Get all teams for a user
 */
async function getUserTeams(db: D1Database, userId: string): Promise<TeamWithRole[]> {
  try {
    const query = `
      SELECT 
        t.*,
        tm.role as user_role,
        COUNT(tm2.user_id) as member_count
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN team_members tm2 ON t.id = tm2.team_id
      WHERE tm.user_id = ?
      GROUP BY t.id, tm.role
      ORDER BY t.updated_at DESC
    `;
    const teams = await db.prepare(query).bind(userId).all<TeamWithRole>();
    return teams.results || [];
  } catch (error) {
    console.error(`[TEAMS API] Failed to get teams for user ${userId}:`, error);
    throw new Error(`Failed to get teams: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a new team
 */
async function createTeam(db: D1Database, team: Omit<Team, "id" | "created_at" | "updated_at">, userId: string): Promise<Team> {
  try {
    const timestamp = new Date().toISOString();
    const teamResult = await db
      .prepare(`INSERT INTO teams (name, owner_id, image_url, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(team.name, userId, team.image_url || null, team.description || null, timestamp, timestamp)
      .run();
    const teamId = teamResult.meta.last_row_id;

    await db
      .prepare(`INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, 'owner', ?)`)
      .bind(teamId, userId, timestamp)
      .run();

    const createdTeam = await db.prepare("SELECT * FROM teams WHERE id = ?").bind(teamId).first<Team>();
    if (!createdTeam) throw new Error("Failed to retrieve created team");
    return createdTeam;
  } catch (error) {
    console.error(`[TEAMS API] Failed to create team:`, error);
    throw new Error(`Failed to create team: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update team details
 */
async function updateTeam(db: D1Database, teamId: number, updates: Partial<Team>, userId: string): Promise<Team> {
  try {
    const memberCheck = await db
      .prepare(`SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND role IN ('owner', 'admin')`)
      .bind(teamId, userId)
      .first<{ role: string }>();
    if (!memberCheck) throw new Error("Unauthorized to update this team");

    const timestamp = new Date().toISOString();
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) { updateFields.push("name = ?"); values.push(updates.name); }
    if (updates.image_url !== undefined) { updateFields.push("image_url = ?"); values.push(updates.image_url); }
    if (updates.description !== undefined) { updateFields.push("description = ?"); values.push(updates.description); }

    updateFields.push("updated_at = ?");
    values.push(timestamp, teamId);

    await db.prepare(`UPDATE teams SET ${updateFields.join(", ")} WHERE id = ?`).bind(...values).run();

    const updatedTeam = await db.prepare("SELECT * FROM teams WHERE id = ?").bind(teamId).first<Team>();
    if (!updatedTeam) throw new Error("Failed to retrieve updated team");
    return updatedTeam;
  } catch (error) {
    console.error(`[TEAMS API] Failed to update team:`, error);
    throw new Error(`Failed to update team: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete a team (owner only)
 */
async function deleteTeam(db: D1Database, teamId: number, userId: string): Promise<void> {
  try {
    const ownerCheck = await db
      .prepare(`SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND role = 'owner'`)
      .bind(teamId, userId)
      .first<{ role: string }>();
    if (!ownerCheck) throw new Error("Only team owners can delete teams");

    await db.prepare("DELETE FROM teams WHERE id = ?").bind(teamId).run();
  } catch (error) {
    console.error(`[TEAMS API] Failed to delete team:`, error);
    throw new Error(`Failed to delete team: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const teamsRouter = new Hono<HonoContext>();

teamsRouter.get('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    try {
        const teams = await getUserTeams(db, userId);
        return c.json({ success: true, teams });
    } catch (error: any) {
        return c.json({ error: 'Failed to get teams', details: error.message }, 500);
    }
});

teamsRouter.post('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    try {
        const data = await c.req.json() as Partial<Team>;
        if (!data.name) {
            return c.json({ error: "Team name is required" }, 400);
        }
        const team = await createTeam(db, {
            name: data.name,
            owner_id: userId,
            image_url: data.image_url,
            description: data.description,
        }, userId);
        return c.json({ success: true, team }, 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to create team', details: error.message }, 500);
    }
});

teamsRouter.put('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const teamId = c.req.param('id');
    try {
        const data = await c.req.json() as Partial<Team>;
        const team = await updateTeam(db, Number(teamId), data, userId);
        return c.json({ success: true, team });
    } catch (error: any) {
        return c.json({ error: 'Failed to update team', details: error.message }, 500);
    }
});

teamsRouter.delete('/:id', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;
    const teamId = c.req.param('id');
    try {
        await deleteTeam(db, Number(teamId), userId);
        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete team', details: error.message }, 500);
    }
});

export default teamsRouter;
