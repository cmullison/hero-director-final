import { z } from 'zod';
import { Context } from 'hono';
import { ApiErrors } from './response';

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.set('validatedBody', validated);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ApiErrors.ValidationError('Invalid request body', {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw ApiErrors.BadRequest('Invalid JSON body');
    }
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);
      c.set('validatedQuery', validated);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ApiErrors.ValidationError('Invalid query parameters', {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw ApiErrors.BadRequest('Invalid query parameters');
    }
  };
}

/**
 * Validate route parameters against a Zod schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const params = c.req.param();
      const validated = schema.parse(params);
      c.set('validatedParams', validated);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ApiErrors.ValidationError('Invalid route parameters', {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw ApiErrors.BadRequest('Invalid route parameters');
    }
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),

  // ID validation
  id: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  // File upload
  fileUpload: z.object({
    file: z.instanceof(File),
    name: z.string().optional(),
    description: z.string().optional(),
    projectId: z.string().uuid().optional(),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

/**
 * Helper to get validated data from context
 */
export function getValidated<T>(c: Context, type: 'body' | 'query' | 'params'): T {
  const key = `validated${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const data = c.get(key);
  
  if (!data) {
    throw new Error(`No validated ${type} found in context`);
  }
  
  return data as T;
}

/**
 * Combine multiple validation middleware
 */
export function validate(options: {
  body?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
}) {
  return async (c: Context, next: () => Promise<void>) => {
    const middleware: Array<(c: Context, next: () => Promise<void>) => Promise<void>> = [];
    
    if (options.body) {
      middleware.push(validateBody(options.body));
    }
    if (options.query) {
      middleware.push(validateQuery(options.query));
    }
    if (options.params) {
      middleware.push(validateParams(options.params));
    }
    
    // Execute all validations
    for (const mw of middleware) {
      await mw(c, async () => {});
    }
    
    await next();
  };
}