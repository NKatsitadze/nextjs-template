import { NextResponse, type NextRequest } from 'next/server';

import { ACCESS_TOKEN_COOKIE } from '@/features/auth/constants/auth';
import { type AccessTokenPayload } from '@/features/auth/types/auth';
import { PROTECTED_ROUTES, SIGN_IN_ROUTE } from '@/shared/constants/routes';
import { verifyToken } from '@/shared/lib/jose';
import { isTrustedOrigin } from '@/shared/utils/request';

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Runs before every matched request (Node runtime).
 * - API writes from a foreign Origin are rejected (CSRF).
 * - Protected pages get a cheap JWT pre-check; the authoritative check (JWT + live Redis
 *   session) is `getSession()` in `(protected)/layout.tsx` and `withAuth` for API routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (isTrustedOrigin(request)) return NextResponse.next();
    return NextResponse.json({ error: 'CSRF_INVALID' }, { status: 403 });
  }

  if (!isProtectedPath(pathname)) return NextResponse.next();

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token && (await verifyToken<AccessTokenPayload>(token))) return NextResponse.next();

  const signInUrl = new URL(SIGN_IN_ROUTE, request.url);
  signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)'],
};
