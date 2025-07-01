import { Context } from 'hono';
import { errorResponse, ApiError } from './response';

/**
 * Global error handler middleware
 */
export function errorHandler() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      console.error('Error caught by handler:', error);

      // Get request ID if available
      const requestId = c.get('requestId') as string | undefined;

      // Handle ApiError instances
      if (error instanceof ApiError) {
        return errorResponse(error.message, {
          status: error.statusCode,
          code: error.code,
          details: error.details,
          requestId,
        });
      }

      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return errorResponse('Validation error', {
          status: 422,
          code: 'VALIDATION_ERROR',
          details: error,
          requestId,
        });
      }

      // Handle generic errors
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Unauthorized')) {
          return errorResponse(error.message, {
            status: 401,
            code: 'UNAUTHORIZED',
            requestId,
          });
        }

        if (error.message.includes('not found')) {
          return errorResponse(error.message, {
            status: 404,
            code: 'NOT_FOUND',
            requestId,
          });
        }

        // Default to internal server error
        return errorResponse('Internal server error', {
          status: 500,
          code: 'INTERNAL_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          requestId,
        });
      }

      // Unknown error type
      return errorResponse('An unexpected error occurred', {
        status: 500,
        code: 'UNKNOWN_ERROR',
        requestId,
      });
    }
  };
}

/**
 * Rate limit error
 */
export class RateLimitError extends ApiError {
  constructor(
    message = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

/**
 * Resource conflict error
 */
export class ConflictError extends ApiError {
  constructor(
    message: string,
    public conflictingResource?: string
  ) {
    super(message, 409, 'CONFLICT', { conflictingResource });
  }
}

/**
 * Payment required error
 */
export class PaymentRequiredError extends ApiError {
  constructor(
    message = 'Payment required',
    public requiredPlan?: string
  ) {
    super(message, 402, 'PAYMENT_REQUIRED', { requiredPlan });
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends ApiError {
  constructor(
    message = 'Service temporarily unavailable',
    public retryAfter?: number
  ) {
    super(message, 503, 'SERVICE_UNAVAILABLE', { retryAfter });
  }
}