import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Authentication middleware
 * Checks if user is authenticated and handles unauthorized access
 */
export async function authenticationChecker(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip authentication for public routes
  const isPublicRoute =
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/';

  if (isPublicRoute) {
    return null; // Continue to next middleware
  }

  // Check authentication
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // For API routes, return JSON error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return null; // Continue to next middleware
}
