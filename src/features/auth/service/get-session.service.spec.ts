import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/session', () => ({ sessionRepository: { find: vi.fn(), touch: vi.fn() } }));
vi.mock('@/features/auth/utils/auth-cookies', () => ({ readAccessTokenCookie: vi.fn() }));
vi.mock('@/shared/lib/jose', () => ({ verifyToken: vi.fn() }));

import { sessionRepository } from '@/features/auth/repository/session';
import { readAccessTokenCookie } from '@/features/auth/utils/auth-cookies';
import { verifyToken } from '@/shared/lib/jose';

import { getSession } from './get-session.service';

const session = {
  sessionId: 'sid',
  user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'user' as const },
  createdAt: 1,
};

describe('getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readAccessTokenCookie).mockResolvedValue('jwt');
    vi.mocked(verifyToken).mockResolvedValue({ sessionId: 'sid' });
    vi.mocked(sessionRepository.find).mockResolvedValue(session);
  });

  it('returns the session and refreshes its idle TTL', async () => {
    await expect(getSession()).resolves.toEqual(session);

    expect(verifyToken).toHaveBeenCalledWith('jwt');
    expect(sessionRepository.find).toHaveBeenCalledWith('sid');
    expect(sessionRepository.touch).toHaveBeenCalledWith('sid', 604800);
  });

  it('returns null without a cookie', async () => {
    vi.mocked(readAccessTokenCookie).mockResolvedValue(undefined);

    await expect(getSession()).resolves.toBeNull();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('returns null for an invalid or expired token', async () => {
    vi.mocked(verifyToken).mockResolvedValue(null);

    await expect(getSession()).resolves.toBeNull();
    expect(sessionRepository.find).not.toHaveBeenCalled();
  });

  it('returns null when the Redis session is gone (idle timeout or logout) and does not touch it', async () => {
    vi.mocked(sessionRepository.find).mockResolvedValue(null);

    await expect(getSession()).resolves.toBeNull();
    expect(sessionRepository.touch).not.toHaveBeenCalled();
  });
});
