import { NextRequest, NextResponse } from 'next/server';

// Use Edge runtime for maximum performance
export const config = {
  matcher: [
    '/mgmt/:path*',
    '/awards/:path*',
    '/archive/:path*',
    '/roster/:path*',
    '/dashboard/:path*',
    '/coach-dashboard/:path*',
    '/schedule/:path*',
    '/teams/:path*',
  ],
};

const SESSION_COOKIE_NAME = 'velox_session';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow public (unauthenticated) access to /roster, /schedule, and /mgmt for scout mode
  const publicPaths = ['/roster', '/schedule', '/mgmt'];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // If no session and it's a public path, allow access (scout mode)
  if (!sessionCookie && isPublicPath) {
    return NextResponse.next();
  }

  // If no session and not a public path, redirect to login with original path
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse session data
  try {
    const sessionData = JSON.parse(sessionCookie.value);

    // Check if email is verified (allow unverified users only on verify-email page)
    if (!sessionData.emailVerified && !pathname.startsWith('/verify-email')) {
      const verifyUrl = new URL('/verify-email', request.url);
      return NextResponse.redirect(verifyUrl);
    }

    // Session is valid and email is verified, allow access
    return NextResponse.next();
  } catch (error) {
    // Invalid session cookie
    // If it's a public path, allow access (scout mode)
    if (isPublicPath) {
      return NextResponse.next();
    }
    // Otherwise redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}
