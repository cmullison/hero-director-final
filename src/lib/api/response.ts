/**
 * Standardized API response utilities
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: number;
    requestId?: string;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    timestamp: number;
    requestId?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standard response headers
 */
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
};

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    headers?: HeadersInit;
    meta?: Record<string, any>;
  }
): Response {
  const { status = 200, headers = {}, meta = {} } = options || {};

  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: Date.now(),
      ...meta,
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });
}

/**
 * Create an error API response
 */
export function errorResponse(
  message: string,
  options?: {
    status?: number;
    code?: string;
    details?: any;
    headers?: HeadersInit;
    requestId?: string;
  }
): Response {
  const { status = 400, code, details, headers = {}, requestId } = options || {};

  const body: ApiErrorResponse = {
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: Date.now(),
      requestId,
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });
}

/**
 * Handle async operations with consistent error handling
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  options?: {
    errorMessage?: string;
    errorStatus?: number;
    requestId?: string;
  }
): Promise<Response> {
  const { errorMessage = 'An error occurred', errorStatus = 500, requestId } = options || {};

  try {
    const result = await operation();
    return successResponse(result, { meta: { requestId } });
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof ApiError) {
      return errorResponse(error.message, {
        status: error.statusCode,
        code: error.code,
        details: error.details,
        requestId,
      });
    }

    return errorResponse(
      error instanceof Error ? error.message : errorMessage,
      {
        status: errorStatus,
        requestId,
      }
    );
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Common API errors
 */
export const ApiErrors = {
  BadRequest: (message = 'Bad Request', details?: any) =>
    new ApiError(message, 400, 'BAD_REQUEST', details),
  
  Unauthorized: (message = 'Unauthorized') =>
    new ApiError(message, 401, 'UNAUTHORIZED'),
  
  Forbidden: (message = 'Forbidden') =>
    new ApiError(message, 403, 'FORBIDDEN'),
  
  NotFound: (message = 'Not Found') =>
    new ApiError(message, 404, 'NOT_FOUND'),
  
  Conflict: (message = 'Conflict', details?: any) =>
    new ApiError(message, 409, 'CONFLICT', details),
  
  ValidationError: (message = 'Validation Error', details?: any) =>
    new ApiError(message, 422, 'VALIDATION_ERROR', details),
  
  InternalError: (message = 'Internal Server Error', details?: any) =>
    new ApiError(message, 500, 'INTERNAL_ERROR', details),
};