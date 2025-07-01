import { Hono } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import {
  successResponse,
  errorResponse,
  ApiErrors,
  validateBody,
  validateParams,
  validate,
  getValidated,
  authMiddleware,
  getAuth,
  getDB,
  withTransaction,
  dbQueries,
  commonSchemas,
  type Database,
} from '@/lib/api';
import type { Env } from '@/lib/types';

// Types
interface FileItem {
  id: string;
  userId: string;
  name: string;
  type: 'file' | 'folder';
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
    auth: any;
  };
};

// Validation schemas
const fileSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    type: z.enum(['file', 'folder']).default('file'),
    parentId: z.string().uuid().nullable().optional(),
    path: z.string().max(1000).optional(),
    codeBody: z.string().optional(),
    projectId: z.string().uuid().nullable().optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.enum(['file', 'folder']).optional(),
    parentId: z.string().uuid().nullable().optional(),
    path: z.string().max(1000).optional(),
    codeBody: z.string().optional(),
    projectId: z.string().uuid().nullable().optional(),
    collaboratorsJson: z.string().optional(),
    version: z.string().optional(),
  }),

  query: z.object({
    type: z.enum(['file', 'folder']).optional(),
    projectId: z.string().uuid().optional(),
    parentId: z.string().uuid().nullable().optional(),
    search: z.string().optional(),
    ...commonSchemas.pagination.shape,
  }),
};

// Create router
const filesRouter = new Hono<HonoContext>();

// Apply auth middleware to all routes
filesRouter.use('*', authMiddleware());

/**
 * Get all files for authenticated user
 */
filesRouter.get('/', validate({ query: fileSchemas.query }), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c);
  const query = getValidated<z.infer<typeof fileSchemas.query>>(c, 'query');

  // Build query
  let filesQuery = db
    .selectFrom('files')
    .where('userId', '=', auth.user.id)
    .selectAll();

  // Apply filters
  if (query.type) {
    filesQuery = filesQuery.where('type', '=', query.type);
  }
  if (query.projectId) {
    filesQuery = filesQuery.where('projectId', '=', query.projectId);
  }
  if (query.parentId !== undefined) {
    filesQuery = filesQuery.where('parentId', '=', query.parentId);
  }
  if (query.search) {
    filesQuery = filesQuery.where('name', 'like', `%${query.search}%`);
  }

  // Apply pagination
  const result = await dbQueries.paginate(db, 'files', {
    page: query.page || 1,
    limit: query.limit || 20,
    where: { userId: auth.user.id },
    orderBy: query.sort || 'updatedAt',
    order: query.order || 'desc',
  });

  return successResponse({
    files: result.items,
    pagination: result.pagination,
  });
});

/**
 * Get a specific file
 */
filesRouter.get(
  '/:id',
  validateParams(commonSchemas.id),
  async (c) => {
    const auth = getAuth(c);
    const db = getDB(c);
    const { id } = getValidated<{ id: string }>(c, 'params');

    const file = await db
      .selectFrom('files')
      .where('id', '=', id)
      .where('userId', '=', auth.user.id)
      .selectAll()
      .executeTakeFirst();

    if (!file) {
      throw ApiErrors.NotFound('File not found');
    }

    return successResponse({ file });
  }
);

/**
 * Create a new file
 */
filesRouter.post(
  '/',
  validateBody(fileSchemas.create),
  async (c) => {
    const auth = getAuth(c);
    const db = getDB(c);
    const data = getValidated<z.infer<typeof fileSchemas.create>>(c, 'body');

    // Validate parent exists if provided
    if (data.parentId) {
      const parentExists = await dbQueries.exists(db, 'files', {
        id: data.parentId,
        userId: auth.user.id,
      });

      if (!parentExists) {
        throw ApiErrors.BadRequest('Parent folder not found');
      }
    }

    // Validate project exists if provided
    if (data.projectId) {
      const projectExists = await dbQueries.exists(db, 'projects', {
        id: data.projectId,
        userId: auth.user.id,
      });

      if (!projectExists) {
        throw ApiErrors.BadRequest('Project not found');
      }
    }

    const timestamp = new Date().toISOString();
    const fileId = nanoid();

    const newFile = await db
      .insertInto('files')
      .values({
        id: fileId,
        userId: auth.user.id,
        name: data.name,
        type: data.type || 'file',
        parentId: data.parentId || null,
        path: data.path || '',
        codeBody: data.codeBody || '',
        projectId: data.projectId || null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return successResponse({ file: newFile }, { status: 201 });
  }
);

/**
 * Update a file
 */
filesRouter.put(
  '/:id',
  validate({
    params: commonSchemas.id,
    body: fileSchemas.update,
  }),
  async (c) => {
    const auth = getAuth(c);
    const db = getDB(c);
    const { id } = getValidated<{ id: string }>(c, 'params');
    const data = getValidated<z.infer<typeof fileSchemas.update>>(c, 'body');

    // Check file exists and belongs to user
    const existingFile = await db
      .selectFrom('files')
      .where('id', '=', id)
      .where('userId', '=', auth.user.id)
      .selectAll()
      .executeTakeFirst();

    if (!existingFile) {
      throw ApiErrors.NotFound('File not found');
    }

    // Validate parent if changing
    if (data.parentId !== undefined && data.parentId !== existingFile.parentId) {
      if (data.parentId) {
        const parentExists = await dbQueries.exists(db, 'files', {
          id: data.parentId,
          userId: auth.user.id,
          type: 'folder',
        });

        if (!parentExists) {
          throw ApiErrors.BadRequest('Parent folder not found');
        }

        // Prevent circular references
        if (data.parentId === id) {
          throw ApiErrors.BadRequest('File cannot be its own parent');
        }
      }
    }

    const timestamp = new Date().toISOString();

    const updatedFile = await db
      .updateTable('files')
      .set({
        ...data,
        updatedAt: timestamp,
      })
      .where('id', '=', id)
      .where('userId', '=', auth.user.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return successResponse({ file: updatedFile });
  }
);

/**
 * Delete a file
 */
filesRouter.delete(
  '/:id',
  validateParams(commonSchemas.id),
  async (c) => {
    const auth = getAuth(c);
    const db = getDB(c);
    const { id } = getValidated<{ id: string }>(c, 'params');

    // Use transaction to handle cascading deletes
    const result = await withTransaction(db, async (trx) => {
      // Check file exists
      const file = await trx
        .selectFrom('files')
        .where('id', '=', id)
        .where('userId', '=', auth.user.id)
        .selectAll()
        .executeTakeFirst();

      if (!file) {
        throw ApiErrors.NotFound('File not found');
      }

      // If it's a folder, delete all children
      if (file.type === 'folder') {
        await trx
          .deleteFrom('files')
          .where('parentId', '=', id)
          .where('userId', '=', auth.user.id)
          .execute();
      }

      // Delete the file itself
      await trx
        .deleteFrom('files')
        .where('id', '=', id)
        .where('userId', '=', auth.user.id)
        .execute();

      return { deleted: true, file };
    });

    return successResponse(result);
  }
);

/**
 * Batch operations
 */
filesRouter.post(
  '/batch',
  validateBody(
    z.object({
      operation: z.enum(['delete', 'move', 'copy']),
      fileIds: z.array(z.string().uuid()).min(1).max(100),
      targetId: z.string().uuid().optional(), // For move/copy operations
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    const db = getDB(c);
    const { operation, fileIds, targetId } = getValidated<{
      operation: 'delete' | 'move' | 'copy';
      fileIds: string[];
      targetId?: string;
    }>(c, 'body');

    // Validate all files belong to user
    const files = await db
      .selectFrom('files')
      .where('userId', '=', auth.user.id)
      .where('id', 'in', fileIds)
      .selectAll()
      .execute();

    if (files.length !== fileIds.length) {
      throw ApiErrors.BadRequest('One or more files not found');
    }

    const results = await withTransaction(db, async (trx) => {
      switch (operation) {
        case 'delete':
          // Delete all files
          const deleteResult = await trx
            .deleteFrom('files')
            .where('userId', '=', auth.user.id)
            .where('id', 'in', fileIds)
            .execute();

          return {
            operation,
            affected: Number(deleteResult.numDeletedRows),
          };

        case 'move':
          if (!targetId) {
            throw ApiErrors.BadRequest('Target folder required for move operation');
          }

          // Verify target is a folder
          const targetFolder = await trx
            .selectFrom('files')
            .where('id', '=', targetId)
            .where('userId', '=', auth.user.id)
            .where('type', '=', 'folder')
            .selectAll()
            .executeTakeFirst();

          if (!targetFolder) {
            throw ApiErrors.BadRequest('Target folder not found');
          }

          // Move files
          const moveResult = await trx
            .updateTable('files')
            .set({
              parentId: targetId,
              updatedAt: new Date().toISOString(),
            })
            .where('userId', '=', auth.user.id)
            .where('id', 'in', fileIds)
            .execute();

          return {
            operation,
            affected: Number(moveResult.numUpdatedRows),
            targetId,
          };

        case 'copy':
          if (!targetId) {
            throw ApiErrors.BadRequest('Target folder required for copy operation');
          }

          // Copy files (create new entries)
          const timestamp = new Date().toISOString();
          const copiedFiles = files.map((file) => ({
            id: nanoid(),
            userId: auth.user.id,
            name: `${file.name} (copy)`,
            type: file.type,
            parentId: targetId,
            path: file.path,
            codeBody: file.codeBody,
            projectId: file.projectId,
            createdAt: timestamp,
            updatedAt: timestamp,
          }));

          await trx.insertInto('files').values(copiedFiles).execute();

          return {
            operation,
            affected: copiedFiles.length,
            targetId,
          };

        default:
          throw ApiErrors.BadRequest('Invalid operation');
      }
    });

    return successResponse(results);
  }
);

export default filesRouter;