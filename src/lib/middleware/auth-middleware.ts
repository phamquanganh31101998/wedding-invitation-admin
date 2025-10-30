import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { TenantErrorCode } from '@/types/tenant';
import { createSecurityErrorResponse } from '@/lib/security/tenant-security';

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  try {
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const errorResponse = createSecurityErrorResponse(
        TenantErrorCode.UNAUTHORIZED,
        'Authentication required',
        401
      );
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.id as string);
    requestHeaders.set('x-user-authenticated', 'true');

    // Create new request with auth headers
    const authenticatedRequest = new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
    });

    return handler(authenticatedRequest);
  } catch (error) {
    console.error('Authentication middleware error:', error);

    const errorResponse = createSecurityErrorResponse(
      TenantErrorCode.UNAUTHORIZED,
      'Authentication failed',
      401
    );
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

/**
 * Rate limiting middleware
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return async (
    request: NextRequest,
    handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) => {
    try {
      // Get client identifier (IP or user ID from headers)
      const clientId =
        request.headers.get('x-user-id') ||
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      const now = Date.now();
      const clientRequests = requestCounts.get(clientId);

      if (!clientRequests || now > clientRequests.resetTime) {
        requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
        return handler(request);
      }

      if (clientRequests.count >= maxRequests) {
        const errorResponse = createSecurityErrorResponse(
          TenantErrorCode.RATE_LIMIT_EXCEEDED,
          'Rate limit exceeded. Please try again later.',
          429
        );
        return NextResponse.json(errorResponse, {
          status: errorResponse.statusCode,
        });
      }

      clientRequests.count++;
      return handler(request);
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      return handler(request); // Continue on rate limit errors
    }
  };
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    const response = await handler(request, ...args);

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    return response;
  };
}

/**
 * Combine multiple middleware functions
 */
export function combineMiddleware(
  ...middlewares: Array<(handler: any) => any>
) {
  return (handler: any) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}
