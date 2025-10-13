import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define protected routes
const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login', '/login/otp'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route);

  // Get the session token from cookies
  const sessionToken = request.cookies.get('admin_session')?.value;

  // If accessing protected route without valid session
  if (isProtectedRoute) {
    if (!sessionToken) {
      // Redirect to login if no session token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');
      await jwtVerify(sessionToken, secret);

      // Token is valid, allow access
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);

      // Clear invalid cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // If accessing auth routes while already authenticated, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');
      await jwtVerify(sessionToken, secret);

      // User is authenticated, redirect to dashboard or intended destination
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } catch (error) {
      // Invalid token, clear it and continue to login
      const response = NextResponse.next();
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};