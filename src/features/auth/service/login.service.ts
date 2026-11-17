import 'server-only';

import { randomBytes } from 'crypto';

import {
  LOGIN_ATTEMPT_WINDOW_SECONDS,
  LOGIN_MAX_ATTEMPTS,
  SESSION_IDLE_TTL_SECONDS,
  SESSION_MAX_AGE_SECONDS,
} from '@/features/auth/constants/auth';
import { loginAttemptsRepository } from '@/features/auth/repository/login-attempts';
import { sessionRepository } from '@/features/auth/repository/session';
import { userRepository } from '@/features/auth/repository/user';
import { type AccessTokenPayload, type AuthUserResponse, type LoginServiceParams } from '@/features/auth/types/auth';
import { setAccessTokenCookie } from '@/features/auth/utils/auth-cookies';
import { toPublicUser } from '@/features/auth/utils/to-public-user';
import { signToken } from '@/shared/lib/jose';
import { type ServiceResult } from '@/shared/types/common';
import { verifyPassword } from '@/shared/utils/password';

export async function loginService({ email, password, ip }: LoginServiceParams): Promise<ServiceResult<AuthUserResponse>> {
  const attempts = await loginAttemptsRepository.increment(ip, email, LOGIN_ATTEMPT_WINDOW_SECONDS);
  if (attempts > LOGIN_MAX_ATTEMPTS) return { data: { error: 'RATE_LIMITED' }, status: 429 };

  const storedUser = await userRepository.findByEmail(email);
  const isValid = await verifyPassword(password, storedUser?.passwordHash ?? null);
  if (!storedUser || !isValid) return { data: { error: 'LOGIN_INVALID' }, status: 401 };

  await loginAttemptsRepository.reset(ip, email);

  const user = toPublicUser(storedUser);
  const sessionId = randomBytes(32).toString('hex');
  await sessionRepository.save({ sessionId, user, createdAt: Date.now() }, SESSION_IDLE_TTL_SECONDS);

  const payload: AccessTokenPayload = { sessionId };
  await setAccessTokenCookie(await signToken(payload, SESSION_MAX_AGE_SECONDS));

  return { data: { user }, status: 200 };
}
