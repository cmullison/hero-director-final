import { D1Database } from "@cloudflare/workers-types";
import type { Env, Database } from "../lib/types";
import { Hono } from 'hono';

export interface Profile {
  id?: number;
  user_id: string;
  name?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

type HonoContext = {
  Bindings: Env;
  Variables: {
    user: { id: string };
  };
};

/**
 * Get a user's profile by their user ID
 */
async function getProfileByUserId(
  db: D1Database,
  userId: string
): Promise<Profile | null> {
  try {
    console.log(`[PROFILE API] Getting profile for user ID: ${userId}`);
    const profile = await db
      .prepare("SELECT * FROM profile WHERE user_id = ?")
      .bind(userId)
      .first<Profile>();

    if (profile) {
      console.log(`[PROFILE API] Found profile for user ID: ${userId}`);
    } else {
      console.log(`[PROFILE API] No profile found for user ID: ${userId}`);
    }

    return profile || null;
  } catch (error) {
    console.error(
      `[PROFILE API] Failed to get profile for user ID ${userId}:`,
      error
    );
    throw new Error(
      `Failed to get profile: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Ensure the profile table exists and has the correct schema
 */
async function ensureProfileTableExists(db: D1Database): Promise<void> {
  try {
    console.log(`[PROFILE API] Checking if profile table exists`);
    await db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        name TEXT,
        bio TEXT,
        phone TEXT,
        location TEXT,
        website TEXT,
        twitter TEXT,
        instagram TEXT,
        linkedin TEXT,
        github TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
      )
      .run();
    console.log(`[PROFILE API] Profile table created or already exists`);

    try {
      await db
        .prepare(
          `
        CREATE INDEX IF NOT EXISTS idx_profile_user_id ON profile (user_id)
      `
        )
        .run();
      console.log(
        `[PROFILE API] Profile table index created or already exists`
      );
    } catch (indexError) {
      console.error(
        `[PROFILE API] Non-critical error creating index:`,
        indexError
      );
    }
  } catch (error) {
    console.error(
      `[PROFILE API] Failed to ensure profile table exists:`,
      error
    );
    throw new Error(
      `Failed to ensure profile table exists: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Create a new profile for a user
 */
async function createProfile(
  db: D1Database,
  profile: Profile
): Promise<Profile> {
  try {
    const {
      user_id,
      name,
      bio,
      phone,
      location,
      website,
      twitter,
      instagram,
      linkedin,
      github,
      avatar_url,
    } = profile;

    console.log(`[PROFILE API] Creating new profile for user ID: ${user_id}`);
    await ensureProfileTableExists(db);
    const timestamp = new Date().toISOString();

    await db
      .prepare(
        `
      INSERT INTO profile 
      (user_id, name, bio, phone, location, website, twitter, instagram, linkedin, github, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        user_id, name || null, bio || null, phone || null, location || null, website || null,
        twitter || null, instagram || null, linkedin || null, github || null, avatar_url || null,
        timestamp, timestamp
      )
      .run();

    const result = await db
      .prepare("SELECT * FROM profile WHERE user_id = ?")
      .bind(user_id)
      .first<Profile>();

    if (!result) {
      throw new Error(`Failed to create profile for user ID ${user_id}`);
    }

    console.log(`[PROFILE API] Successfully created profile for user ID: ${user_id}`);
    return result;
  } catch (error) {
    console.error(`[PROFILE API] Failed to create profile for user ID ${profile.user_id}:`, error);
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      const existingProfile = await getProfileByUserId(db, profile.user_id);
      if (existingProfile) {
        return existingProfile;
      }
    }
    throw new Error(`Failed to create profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update an existing user profile
 */
async function updateProfile(
  db: D1Database,
  profile: Profile
): Promise<Profile> {
  try {
    const { user_id, name, bio, phone, location, website, twitter, instagram, linkedin, github, avatar_url } = profile;
    console.log(`[PROFILE API] Attempting to update profile for user ID: ${user_id}`);
    await ensureProfileTableExists(db);

    const existingProfile = await getProfileByUserId(db, user_id);
    if (!existingProfile) {
      console.log(`[PROFILE API] No existing profile for user ID: ${user_id}, creating new profile`);
      return createProfile(db, profile);
    }

    console.log(`[PROFILE API] Updating existing profile for user ID: ${user_id}`);
    const timestamp = new Date().toISOString();

    await db
      .prepare(
        `
      UPDATE profile
      SET name = ?, bio = ?, phone = ?, location = ?, website = ?, 
          twitter = ?, instagram = ?, linkedin = ?, github = ?, avatar_url = ?, updated_at = ?
      WHERE user_id = ?
    `
      )
      .bind(
        name || null, bio || null, phone || null, location || null, website || null,
        twitter || null, instagram || null, linkedin || null, github || null, avatar_url || null,
        timestamp, user_id
      )
      .run();

    const result = await db
      .prepare("SELECT * FROM profile WHERE user_id = ?")
      .bind(user_id)
      .first<Profile>();

    if (!result) {
      throw new Error(`Failed to retrieve profile after update for user ID ${user_id}`);
    }

    console.log(`[PROFILE API] Successfully updated profile for user ID: ${user_id}`);
    return result;
  } catch (error) {
    console.error(`[PROFILE API] Failed to update profile for user ID ${profile.user_id}:`, error);
    throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const profileRouter = new Hono<HonoContext>();

profileRouter.get('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;

    try {
        await ensureProfileTableExists(db);
        let profile = await getProfileByUserId(db, userId);

        if (!profile) {
            profile = await createProfile(db, { user_id: userId });
        }
        return c.json({ profile });
    } catch (error: any) {
        console.error(`[PROFILE API] Error handling GET request:`, error);
        return c.json({ error: "Failed to get profile", details: error.message }, 500);
    }
});

profileRouter.post('/', async (c) => {
    const userId = c.get('user').id;
    const db = c.env.DB;

    try {
        const data: Profile = await c.req.json();
        data.user_id = userId; // Enforce user_id

        await ensureProfileTableExists(db);
        const updatedProfile = await updateProfile(db, data);
        return c.json({ success: true, profile: updatedProfile });
    } catch (error: any) {
        console.error(`[PROFILE API] Error handling POST request:`, error);
        return c.json({ error: "Failed to update profile", details: error.message }, 500);
    }
});

export default profileRouter;
