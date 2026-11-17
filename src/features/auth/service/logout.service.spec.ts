import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/session', () => ({ sessionRepository: { delete: vi.fn() } }));
vi.mock('@/features/auth/utils/auth-cookies', () => ({
  readAccessTokenCookie: vi.fn(),
  clearAccessTokenCookie: vi.fn(),
}));
vi.mock('@/shared/lib/jose', () => ({ verifyToken: vi.fn() }));

import { sessionRepository } from '@/features/auth/repository/session';
import { clearAccessTokenCookie, readAccessTokenCookie } from '@/features/auth/utils/auth-cookies';
import { verifyToken } from '@/shared/lib/jose';

import { logoutService } from './logout.service';

describe('logoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the Redis session and clears the cookie', async () => {
    vi.mocked(readAccessTokenCookie).mockResolvedValue('jwt');
    vi.mocked(verifyToken).mockResolvedValue({ sessionId: 'sid' });

    await expect(logoutService()).resolves.toEqual({ data: { success: true }, status: 200 });
    expect(sessionRepository.delete).toHaveBeenCalledWith('sid');
    expect(clearAccessTokenCookie).toHaveBeenCalled();
  });

  it.each([
    ['no cookie', undefined, null],
    ['an invalid token', 'bad', null],
  ])('still clears the cookie with %s', async (_case, cookie, payload) => {
    vi.mocked(readAccessTokenCookie).mockResolvedValue(cookie);
    vi.mocked(verifyToken).mockResolvedValue(payload);

    await expect(logoutService()).resolves.toMatchObject({ status: 200 });
    expect(sessionRepository.delete).not.toHaveBeenCalled();
    expect(clearAccessTokenCookie).toHaveBeenCalled();
  });
});
