import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { ApiErrors } from './response';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface Session {
  id: string;
  user_id: string;
  expires_at: string;
}

interface Database {
  users: User;
  sessions: Session;
}

interface AuthContext {
  user: User;
  session: Session;
}

/**
 * Auth middleware that validates session and adds user to context
 */
export function authMiddleware(options?: {
  optional?: boolean;
}) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const sessionId = getCookie(c, 'session_id');
      
      if (!sessionId) {
        if (options?.optional) {
          await next();
          return;
        }
        throw ApiErrors.Unauthorized('No session found');
      }

      // Get database connection
      const env = c.env as { DB: D1Database };
      const db = new Kysely<Database>({
        dialect: new D1Dialect({ database: env.DB }),
      });

      // Verify session
      const sessionData = await db
        .selectFrom('sessions')
        .where('id', '=', sessionId)
        .where('expires_at', '>', new Date().toISOString())
        .selectAll()
        .executeTakeFirst();

      if (!sessionData) {
        if (options?.optional) {
          await next();
          return;
        }
        throw ApiErrors.Unauthorized('Invalid or expired session');
      }

      // Get user data
      const userData = await db
        .selectFrom('users')
        .where('id', '=', sessionData.user_id)
        .selectAll()
        .executeTakeFirst();

      if (!userData) {
        throw ApiErrors.Unauthorized('User not found');
      }

      // Add to context
      c.set('auth', {
        user: userData,
        session: sessionData,
      } as AuthContext);

      await next();
    } catch (error) {
      if (error instanceof ApiErrors.constructor) {
        throw error;
      }
      console.error('Auth middleware error:', error);
      throw ApiErrors.InternalError('Authentication error');
    }
  };
}

/**
 * Get authenticated user from context
 */
export function getAuth(c: Context): AuthContext {
  const auth = c.get('auth') as AuthContext | undefined;
  
  if (!auth) {
    throw ApiErrors.Unauthorized('Not authenticated');
  }
  
  return auth;
}

/**
 * Get optional authenticated user from context
 */
export function getOptionalAuth(c: Context): AuthContext | null {
  return c.get('auth') as AuthContext | null;
}

/**
 * Check if user has specific permissions
 */
export async function checkPermission(
  c: Context,
  permission: string
): Promise<boolean> {
  const auth = getAuth(c);
  
  // Add your permission checking logic here
  // This is a placeholder implementation
  
  return true;
}

/**
 * Require specific permissions
 */
export function requirePermission(permission: string) {
  return async (c: Context, next: () => Promise<void>) => {
    const hasPermission = await checkPermission(c, permission);
    
    if (!hasPermission) {
      throw ApiErrors.Forbidden(`Missing required permission: ${permission}`);
    }
    
    await next();
  };
}

/**
 * Create a new session
 */
export async function createSession(
  db: Kysely<Database>,
  userId: string,
  expiresInHours = 24 * 7 // 1 week default
): Promise<Session> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const session = await db
    .insertInto('sessions')
    .values({
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return session;
}

/**
 * Delete a session
 */
export async function deleteSession(
  db: Kysely<Database>,
  sessionId: string
): Promise<void> {
  await db
    .deleteFrom('sessions')
    .where('id', '=', sessionId)
    .execute();
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(
  db: Kysely<Database>
): Promise<number> {
  const result = await db
    .deleteFrom('sessions')
    .where('expires_at', '<', new Date().toISOString())
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}