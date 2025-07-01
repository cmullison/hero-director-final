# API Migration Guide

## Overview

This guide explains the new standardized API patterns introduced in the Dash Agent codebase and how to migrate existing endpoints.

## New API Utilities

All new utilities are located in `/src/lib/api/`:

### 1. Response Utilities (`response.ts`)

**Before:**
```typescript
return c.json({ success: true, files });
return c.json({ error: 'Failed to create file', details: error.message }, 500);
```

**After:**
```typescript
return successResponse({ files });
return errorResponse('Failed to create file', { status: 500, details: error.message });
```

**Benefits:**
- Consistent response format across all endpoints
- Automatic timestamp and request ID inclusion
- Type-safe responses

### 2. Validation Utilities (`validation.ts`)

**Before:**
```typescript
const data = await c.req.json();
// Manual validation or no validation
```

**After:**
```typescript
// Define schema
const schema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['file', 'folder']),
});

// Apply middleware
router.post('/', validateBody(schema), async (c) => {
  const data = getValidated(c, 'body');
  // data is fully typed and validated
});
```

**Benefits:**
- Automatic validation with detailed error messages
- Type inference from schemas
- Consistent error responses for validation failures

### 3. Auth Utilities (`auth.ts`)

**Before:**
```typescript
// Inconsistent auth checks across files
const userId = c.get('user').id;
```

**After:**
```typescript
// Apply middleware
router.use('*', authMiddleware());

// Get auth context
const auth = getAuth(c); // Throws if not authenticated
const user = auth.user;
```

**Benefits:**
- Centralized auth logic
- Consistent error handling
- Session management utilities

### 4. Database Utilities (`database.ts`)

**Before:**
```typescript
const db = c.env.DB;
const files = await db.prepare("SELECT * FROM files WHERE userId = ?").bind(userId).all();
```

**After:**
```typescript
const db = getDB(c);
const files = await db
  .selectFrom('files')
  .where('userId', '=', auth.user.id)
  .selectAll()
  .execute();

// With transactions
const result = await withTransaction(db, async (trx) => {
  // Multiple operations in transaction
});

// With pagination
const result = await dbQueries.paginate(db, 'files', {
  page: 1,
  limit: 20,
  where: { userId: auth.user.id }
});
```

**Benefits:**
- Type-safe queries with Kysely
- Built-in pagination
- Transaction support
- Common query patterns

## Migration Steps

### Step 1: Update Imports

```typescript
import {
  successResponse,
  errorResponse,
  validateBody,
  authMiddleware,
  getAuth,
  getDB,
  // ... other utilities
} from '@/lib/api';
```

### Step 2: Apply Middleware

```typescript
const router = new Hono<HonoContext>();

// Apply to all routes
router.use('*', authMiddleware());

// Or specific routes
router.get('/public', /* no auth */, handler);
router.get('/private', authMiddleware(), handler);
```

### Step 3: Define Validation Schemas

```typescript
const schemas = {
  create: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
  
  query: z.object({
    search: z.string().optional(),
    ...commonSchemas.pagination.shape,
  }),
};
```

### Step 4: Update Route Handlers

```typescript
router.post(
  '/',
  validateBody(schemas.create),
  async (c) => {
    const auth = getAuth(c);
    const db = getDB(c);
    const data = getValidated(c, 'body');
    
    try {
      const result = await db
        .insertInto('table')
        .values({ ...data, userId: auth.user.id })
        .returningAll()
        .executeTakeFirstOrThrow();
        
      return successResponse({ item: result }, { status: 201 });
    } catch (error) {
      // Errors are automatically handled by errorHandler middleware
      throw ApiErrors.BadRequest('Failed to create item');
    }
  }
);
```

### Step 5: Add Error Handler

In your main router setup:

```typescript
import { errorHandler } from '@/lib/api';

app.use('*', errorHandler());
```

## Common Patterns

### 1. Paginated Lists

```typescript
router.get('/', validate({ query: commonSchemas.pagination }), async (c) => {
  const query = getValidated(c, 'query');
  
  const result = await dbQueries.paginate(db, 'items', {
    page: query.page,
    limit: query.limit,
    where: { userId: auth.user.id },
  });
  
  return successResponse(result);
});
```

### 2. Resource CRUD

```typescript
// Create
router.post('/', validateBody(schema), async (c) => {
  const data = getValidated(c, 'body');
  const item = await db.insertInto('items').values(data).returningAll().executeTakeFirstOrThrow();
  return successResponse({ item }, { status: 201 });
});

// Read
router.get('/:id', validateParams(commonSchemas.id), async (c) => {
  const { id } = getValidated(c, 'params');
  const item = await db.selectFrom('items').where('id', '=', id).selectAll().executeTakeFirst();
  if (!item) throw ApiErrors.NotFound();
  return successResponse({ item });
});

// Update
router.put('/:id', validate({ params: commonSchemas.id, body: schema }), async (c) => {
  const { id } = getValidated(c, 'params');
  const data = getValidated(c, 'body');
  const item = await db.updateTable('items').set(data).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
  return successResponse({ item });
});

// Delete
router.delete('/:id', validateParams(commonSchemas.id), async (c) => {
  const { id } = getValidated(c, 'params');
  await db.deleteFrom('items').where('id', '=', id).execute();
  return successResponse({ deleted: true });
});
```

### 3. File Uploads

```typescript
router.post('/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    throw ApiErrors.BadRequest('No file provided');
  }
  
  // Process file...
  return successResponse({ uploaded: true });
});
```

### 4. Batch Operations

```typescript
router.post('/batch', validateBody(batchSchema), async (c) => {
  const { operation, ids } = getValidated(c, 'body');
  
  const results = await withTransaction(db, async (trx) => {
    // Perform batch operations in transaction
  });
  
  return successResponse({ results });
});
```

## Benefits of Migration

1. **Consistency**: All APIs follow the same patterns
2. **Type Safety**: Full TypeScript support with validation
3. **Error Handling**: Centralized error handling with proper status codes
4. **Security**: Built-in auth checks and input validation
5. **Performance**: Optimized queries with pagination and caching support
6. **Developer Experience**: Less boilerplate, more focus on business logic

## Next Steps

1. Start with one API endpoint as a pilot
2. Test thoroughly including error cases
3. Gradually migrate other endpoints
4. Remove old utility functions once migration is complete

## Example: Complete Migration

See `/src/api/files-v2.ts` for a complete example of a migrated API endpoint that demonstrates all the new patterns and utilities.