import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/src/lib/supabase/middleware';

/**
 * Route guard for all /admin/* paths.
 *
 * On every request:
 * 1. Refreshes the Supabase session cookie so Server Components always
 *    have access to a valid session (Requirement 1.6).
 * 2. Redirects unauthenticated users to /admin/login (Requirement 1.1, 1.7).
 * 3. Allows /admin/login through unconditionally so the sign-in page is
 *    always reachable.
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // Refresh the session — this updates the Set-Cookie header on `response`
  // so the browser receives a fresh session token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow the login page through regardless of auth state
  if (pathname === '/admin/login') {
    return response;
  }

  // Redirect unauthenticated requests to the login page
  if (!user) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
