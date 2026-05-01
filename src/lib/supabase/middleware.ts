import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Creates a Supabase client for use in the Next.js proxy (formerly middleware).
 * Refreshes the session cookie on every request so Server Components always
 * have access to a valid session.
 *
 * Returns both the Supabase client and the (potentially mutated) response so
 * the caller can forward updated Set-Cookie headers to the browser.
 */
export function createMiddlewareClient(request: NextRequest) {
  // Start with a response that passes the request through unchanged.
  let response = NextResponse.next({ request });

  const supabase = createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto the request so downstream server components see them.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Rebuild the response so the updated cookies are sent to the browser.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}
