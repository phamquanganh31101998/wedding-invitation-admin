import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticationChecker } from './middlewares/authentication-checker.middleware';
import { rateLimiter } from './middlewares/rate-limiter.middleware';
import { securityHeaders } from './middlewares/security-headers.middleware';

/**
 * Main middleware function
 * Combines authentication, rate limiting, and security headers
 */
export async function middleware(req: NextRequest) {
  // 1. Check authentication
  const authResponse = await authenticationChecker(req);
  if (authResponse) {
    return authResponse; // Return early if authentication fails
  }

  // 2. Apply rate limiting
  const rateLimitResponse = rateLimiter(req);
  if (rateLimitResponse) {
    return rateLimitResponse; // Return early if rate limit exceeded
  }

  // 3. Create response and add security headers
  const response = NextResponse.next();
  return securityHeaders(req, response);
}

// Protect all routes except public ones
export const config = {
  matcher: [
    // Protect all API routes except auth
    '/api/:path((?!auth).*)*',
    // Protect dashboard and other authenticated pages
    '/dashboard/:path*',
    '/(authenticated)/:path*',
  ],
};
