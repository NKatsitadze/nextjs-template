import 'server-only';

import { cache } from 'react';

import { SESSION_IDLE_TTL_SECONDS } from '@/features/auth/constants/auth';
import { sessionRepository } from '@/features/auth/repository/session';
import { type AccessTokenPayload, type SessionData } from '@/features/auth/types/auth';
import { readAccessTokenCookie } from '@/features/auth/utils/auth-cookies';
import { verifyToken } from '@/shared/lib/jose';

/**
 * The authoritative session check: valid JWT *and* a live Redis session. Refreshes the idle TTL.
 * Wrapped in `cache` so layouts and pages in one render share a single lookup.
 */
export const getSession = cache(async (): Promise<SessionData | null> => {
  const token = await readAccessTokenCookie();
  if (!token) return null;

  const payload = await verifyToken<AccessTokenPayload>(token);
  if (!payload) return null;

  const session = await sessionRepository.find(payload.sessionId);
  if (!session) return null;

  await sessionRepository.touch(session.sessionId, SESSION_IDLE_TTL_SECONDS);
  return session;
});
