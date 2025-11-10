import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

/**
 * Rate limiting middleware
 * Limits the number of requests per client within a time window
 */
export function rateLimiter(req: NextRequest) {
  // Get client identifier
  const clientId =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const clientRequests = requestCounts.get(clientId);

  // Check rate limit
  if (!clientRequests || now > clientRequests.resetTime) {
    // First request or window expired - reset counter
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return null; // Continue to next middleware
  }

  if (clientRequests.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please try again later.',
        },
      },
      { status: 429 }
    );
  }

  // Increment counter
  clientRequests.count++;
  return null; // Continue to next middleware
}

/**
 * Cleanup old entries periodically to prevent memory leaks
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [clientId, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(clientId);
      }
    }
  }, RATE_LIMIT_WINDOW_MS);
}
