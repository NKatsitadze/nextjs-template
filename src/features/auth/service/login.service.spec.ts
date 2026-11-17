import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/user', () => ({ userRepository: { findByEmail: vi.fn() } }));
vi.mock('@/features/auth/repository/session', () => ({ sessionRepository: { save: vi.fn() } }));
vi.mock('@/features/auth/repository/login-attempts', () => ({
  loginAttemptsRepository: { increment: vi.fn(), reset: vi.fn() },
}));
vi.mock('@/features/auth/utils/auth-cookies', () => ({ setAccessTokenCookie: vi.fn() }));
vi.mock('@/shared/lib/jose', () => ({ signToken: vi.fn(async () => 'signed-jwt') }));
vi.mock('@/shared/utils/password', () => ({ verifyPassword: vi.fn() }));

import { loginAttemptsRepository } from '@/features/auth/repository/login-attempts';
import { sessionRepository } from '@/features/auth/repository/session';
import { userRepository } from '@/features/auth/repository/user';
import { setAccessTokenCookie } from '@/features/auth/utils/auth-cookies';
import { signToken } from '@/shared/lib/jose';
import { verifyPassword } from '@/shared/utils/password';

import { loginService } from './login.service';

const userId = new ObjectId();
const storedUser = {
  _id: userId,
  name: 'Ana',
  email: 'ana@example.com',
  passwordHash: 'hash',
  role: 'user' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const params = { email: 'ana@example.com', password: 'secret123', ip: '1.2.3.4' };

describe('loginService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loginAttemptsRepository.increment).mockResolvedValue(1);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(storedUser);
    vi.mocked(verifyPassword).mockResolvedValue(true);
  });

  it('creates a session, sets the cookie and returns the public user', async () => {
    const result = await loginService(params);

    const publicUser = { id: userId.toString(), name: 'Ana', email: 'ana@example.com', role: 'user' };
    expect(result).toEqual({ data: { user: publicUser }, status: 200 });
    expect(loginAttemptsRepository.increment).toHaveBeenCalledWith('1.2.3.4', 'ana@example.com', 900);
    expect(verifyPassword).toHaveBeenCalledWith('secret123', 'hash');
    expect(sessionRepository.save).toHaveBeenCalledWith(
      { sessionId: expect.stringMatching(/^[a-f0-9]{64}$/), user: publicUser, createdAt: expect.any(Number) },
      604800,
    );
    expect(signToken).toHaveBeenCalledWith({ sessionId: expect.any(String) }, 2592000);
    expect(setAccessTokenCookie).toHaveBeenCalledWith('signed-jwt');
    expect(loginAttemptsRepository.reset).toHaveBeenCalledWith('1.2.3.4', 'ana@example.com');
  });

  it('returns 429 once the attempt limit is exceeded, before checking credentials', async () => {
    vi.mocked(loginAttemptsRepository.increment).mockResolvedValue(6);

    await expect(loginService(params)).resolves.toEqual({ data: { error: 'RATE_LIMITED' }, status: 429 });
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('returns 401 for a wrong password without creating a session', async () => {
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(loginService(params)).resolves.toEqual({ data: { error: 'LOGIN_INVALID' }, status: 401 });
    expect(sessionRepository.save).not.toHaveBeenCalled();
    expect(setAccessTokenCookie).not.toHaveBeenCalled();
    expect(loginAttemptsRepository.reset).not.toHaveBeenCalled();
  });

  it('returns the same 401 for an unknown email and still runs the password check', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(loginService(params)).resolves.toEqual({ data: { error: 'LOGIN_INVALID' }, status: 401 });
    expect(verifyPassword).toHaveBeenCalledWith('secret123', null);
  });

  it('propagates repository failures', async () => {
    vi.mocked(userRepository.findByEmail).mockRejectedValue(new Error('mongo down'));

    await expect(loginService(params)).rejects.toThrow('mongo down');
  });
});
