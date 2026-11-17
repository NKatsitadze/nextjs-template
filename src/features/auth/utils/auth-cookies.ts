import 'server-only';

import { cookies } from 'next/headers';

import { ACCESS_TOKEN_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/features/auth/constants/auth';

export async function readAccessTokenCookie(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function setAccessTokenCookie(token: string): Promise<void> {
  (await cookies()).set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAccessTokenCookie(): Promise<void> {
  (await cookies()).delete(ACCESS_TOKEN_COOKIE);
}
