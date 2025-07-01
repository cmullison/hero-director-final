import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { Context } from 'hono';

/**
 * Database schema types
 */
export interface Database {
  users: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  sessions: {
    id: string;
    user_id: string;
    expires_at: string;
    created_at: string;
  };
  conversations: {
    id: string;
    user_id: string;
    title: string;
    messages: string; // JSON
    created_at: string;
    updated_at: string;
  };
  projects: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  };
  files: {
    id: string;
    user_id: string;
    project_id: string | null;
    name: string;
    path: string;
    size: number;
    content_type: string;
    created_at: string;
  };
  code_blocks: {
    id: string;
    user_id: string;
    project_id: string | null;
    language: string;
    code: string;
    created_at: string;
  };
}

/**
 * Get database instance from context
 */
export function getDB(c: Context): Kysely<Database> {
  const env = c.env as { DB: D1Database };
  
  if (!env.DB) {
    throw new Error('Database not configured');
  }

  return new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  });
}

/**
 * Database transaction wrapper
 */
export async function withTransaction<T>(
  db: Kysely<Database>,
  callback: (trx: Kysely<Database>) => Promise<T>
): Promise<T> {
  return await db.transaction().execute(callback);
}

/**
 * Common database queries
 */
export const dbQueries = {
  /**
   * Check if a record exists
   */
  async exists(
    db: Kysely<Database>,
    table: keyof Database,
    where: Record<string, any>
  ): Promise<boolean> {
    const query = db.selectFrom(table).select('id' as any);
    
    Object.entries(where).forEach(([key, value]) => {
      query.where(key as any, '=', value);
    });
    
    const result = await query.executeTakeFirst();
    return !!result;
  },

  /**
   * Get paginated results
   */
  async paginate<T extends keyof Database>(
    db: Kysely<Database>,
    table: T,
    options: {
      page: number;
      limit: number;
      where?: Record<string, any>;
      orderBy?: string;
      order?: 'asc' | 'desc';
    }
  ) {
    const { page, limit, where, orderBy = 'created_at', order = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Build query
    let query = db.selectFrom(table).selectAll();
    
    // Apply where conditions
    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        query = query.where(key as any, '=', value);
      });
    }

    // Get total count
    const countQuery = db.selectFrom(table).select(
      db.fn.count('id' as any).as('count')
    );
    
    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        countQuery.where(key as any, '=', value);
      });
    }
    
    const { count } = await countQuery.executeTakeFirstOrThrow();
    const total = Number(count);

    // Get paginated results
    const items = await query
      .orderBy(orderBy as any, order)
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Batch insert with chunking
   */
  async batchInsert<T extends keyof Database>(
    db: Kysely<Database>,
    table: T,
    records: Array<Omit<Database[T], 'id' | 'created_at' | 'updated_at'>>,
    chunkSize = 100
  ): Promise<number> {
    let inserted = 0;
    
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const result = await db
        .insertInto(table)
        .values(chunk as any)
        .execute();
      
      inserted += Number(result.numInsertedOrUpdatedRows);
    }
    
    return inserted;
  },

  /**
   * Soft delete (if implemented)
   */
  async softDelete<T extends keyof Database>(
    db: Kysely<Database>,
    table: T,
    id: string
  ): Promise<boolean> {
    // This assumes a deleted_at column exists
    const result = await db
      .updateTable(table)
      .set({ deleted_at: new Date().toISOString() } as any)
      .where('id' as any, '=', id)
      .execute();
    
    return Number(result.numUpdatedRows) > 0;
  },
};

/**
 * Database health check
 */
export async function checkDatabaseHealth(db: Kysely<Database>): Promise<{
  healthy: boolean;
  error?: string;
}> {
  try {
    await db.selectFrom('users').select('id').limit(1).execute();
    return { healthy: true };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}