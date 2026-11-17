import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => cookieStore) }));

import { clearAccessTokenCookie, readAccessTokenCookie, setAccessTokenCookie } from './auth-cookies';

describe('auth cookies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('reads the access token', async () => {
    cookieStore.get.mockReturnValue({ value: 'jwt' });

    await expect(readAccessTokenCookie()).resolves.toBe('jwt');
    expect(cookieStore.get).toHaveBeenCalledWith('accessToken');
  });

  it('returns undefined when the cookie is missing', async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(readAccessTokenCookie()).resolves.toBeUndefined();
  });

  it.each([
    ['production', true],
    ['development', false],
  ])('sets an httpOnly cookie (%s → secure=%s)', async (nodeEnv, secure) => {
    vi.stubEnv('NODE_ENV', nodeEnv);

    await setAccessTokenCookie('jwt');

    expect(cookieStore.set).toHaveBeenCalledWith('accessToken', 'jwt', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 2592000,
    });
  });

  it('deletes the cookie', async () => {
    await clearAccessTokenCookie();

    expect(cookieStore.delete).toHaveBeenCalledWith('accessToken');
  });
});
