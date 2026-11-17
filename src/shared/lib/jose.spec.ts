import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/env', () => ({
  env: { get: () => ({ JWT_SECRET: 'a'.repeat(32) }) },
}));

import { signToken, verifyToken } from './jose';

describe('jose', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('signs a token that verifies back to the payload', async () => {
    const token = await signToken({ sessionId: 'session-1' }, 60);

    await expect(verifyToken<{ sessionId: string }>(token)).resolves.toMatchObject({ sessionId: 'session-1' });
  });

  it('returns null for a malformed token', async () => {
    await expect(verifyToken('not.a.token')).resolves.toBeNull();
  });

  it('returns null for a token signed with another secret', async () => {
    const foreign = await new SignJWT({ sessionId: 'x' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(new TextEncoder().encode('b'.repeat(32)));

    await expect(verifyToken(foreign)).resolves.toBeNull();
  });

  it('returns null for an expired token', async () => {
    vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') });
    const token = await signToken({ sessionId: 'x' }, 1);
    vi.setSystemTime(new Date('2026-01-01T00:01:00Z'));

    await expect(verifyToken(token)).resolves.toBeNull();
  });
});
