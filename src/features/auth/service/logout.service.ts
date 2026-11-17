import 'server-only';

import { sessionRepository } from '@/features/auth/repository/session';
import { type AccessTokenPayload } from '@/features/auth/types/auth';
import { clearAccessTokenCookie, readAccessTokenCookie } from '@/features/auth/utils/auth-cookies';
import { verifyToken } from '@/shared/lib/jose';
import { type ServiceResult } from '@/shared/types/common';

export async function logoutService(): Promise<ServiceResult<{ success: true }>> {
  const token = await readAccessTokenCookie();
  const payload = token ? await verifyToken<AccessTokenPayload>(token) : null;

  if (payload) await sessionRepository.delete(payload.sessionId);
  await clearAccessTokenCookie();

  return { data: { success: true }, status: 200 };
}
