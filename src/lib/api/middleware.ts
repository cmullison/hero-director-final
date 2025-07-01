import { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { nanoid } from 'nanoid';

/**
 * Request ID middleware - adds unique ID to each request
 */
export function requestId() {
  return async (c: Context, next: Next) => {
    const id = nanoid();
    c.set('requestId', id);
    c.header('X-Request-ID', id);
    await next();
  };
}

/**
 * Logging middleware
 */
export function logger() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const requestId = c.get('requestId') || 'unknown';
    
    console.log({
      type: 'request',
      requestId,
      method: c.req.method,
      path: c.req.path,
      timestamp: new Date().toISOString(),
    });

    await next();

    const duration = Date.now() - start;
    console.log({
      type: 'response',
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
      timestamp: new Date().toISOString(),
    });
  };
}

/**
 * Standard CORS configuration
 */
export function standardCors() {
  return cors({
    origin: (origin) => {
      // Allow requests from localhost in development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin;
      }
      
      // Allow configured domains
      const allowedDomains = [
        'https://agents.mulls.io',
        'https://dash.mulls.io',
      ];
      
      return allowedDomains.includes(origin) ? origin : null;
    },
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
}

/**
 * Rate limiting middleware using KV
 */
export function rateLimiter(options: {
  key: (c: Context) => string;
  limit: number;
  window: number; // in seconds
}) {
  return async (c: Context, next: Next) => {
    const env = c.env as { RATE_LIMIT_KV?: KVNamespace };
    
    if (!env.RATE_LIMIT_KV) {
      // Skip rate limiting if KV not configured
      await next();
      return;
    }

    const key = `rate_limit:${options.key(c)}`;
    const now = Date.now();
    const windowStart = now - options.window * 1000;

    // Get current count
    const data = await env.RATE_LIMIT_KV.get(key, 'json') as {
      requests: Array<{ timestamp: number }>;
    } | null;

    const requests = data?.requests || [];
    const recentRequests = requests.filter(r => r.timestamp > windowStart);

    if (recentRequests.length >= options.limit) {
      const oldestRequest = Math.min(...recentRequests.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + options.window * 1000 - now) / 1000);
      
      return c.json(
        {
          success: false,
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          },
        },
        429,
        {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': options.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(oldestRequest + options.window * 1000).toISOString(),
        }
      );
    }

    // Add current request
    recentRequests.push({ timestamp: now });
    
    // Store updated count
    await env.RATE_LIMIT_KV.put(
      key,
      JSON.stringify({ requests: recentRequests }),
      { expirationTtl: options.window }
    );

    // Add rate limit headers
    c.header('X-RateLimit-Limit', options.limit.toString());
    c.header('X-RateLimit-Remaining', (options.limit - recentRequests.length).toString());

    await next();
  };
}

/**
 * Cache middleware using KV
 */
export function cache(options: {
  key: (c: Context) => string;
  ttl: number; // in seconds
  condition?: (c: Context) => boolean;
}) {
  return async (c: Context, next: Next) => {
    const env = c.env as { CACHE_KV?: KVNamespace };
    
    if (!env.CACHE_KV) {
      // Skip caching if KV not configured
      await next();
      return;
    }

    // Check condition
    if (options.condition && !options.condition(c)) {
      await next();
      return;
    }

    const cacheKey = `cache:${options.key(c)}`;

    // Try to get from cache
    const cached = await env.CACHE_KV.get(cacheKey, 'json') as {
      body: any;
      headers: Record<string, string>;
      status: number;
    } | null;

    if (cached) {
      // Return cached response
      return c.json(cached.body, cached.status, {
        ...cached.headers,
        'X-Cache': 'HIT',
      });
    }

    // Execute handler
    await next();

    // Cache successful responses only
    if (c.res.status >= 200 && c.res.status < 300) {
      const body = await c.res.json();
      
      await env.CACHE_KV.put(
        cacheKey,
        JSON.stringify({
          body,
          headers: Object.fromEntries(c.res.headers.entries()),
          status: c.res.status,
        }),
        { expirationTtl: options.ttl }
      );

      // Recreate response with cache header
      return c.json(body, c.res.status, {
        ...Object.fromEntries(c.res.headers.entries()),
        'X-Cache': 'MISS',
      });
    }
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next();
    
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );
  };
}