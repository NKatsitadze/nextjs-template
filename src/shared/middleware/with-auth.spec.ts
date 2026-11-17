import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/service/get-session.service', () => ({ getSession: vi.fn() }));
vi.mock('@/shared/lib/sentry', () => ({ setSentryUser: vi.fn() }));

import { getSession } from '@/features/auth/service/get-session.service';
import { setSentryUser } from '@/shared/lib/sentry';

import { withAuth } from './with-auth';

const session = {
  sessionId: 'sid',
  user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'user' as const },
  createdAt: 1,
};
const request = new Request('http://localhost/api/notes');

describe('withAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without calling the handler when there is no session', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const handler = vi.fn();

    const response = await withAuth(handler)(request, undefined);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'UNAUTHORIZED' });
    expect(handler).not.toHaveBeenCalled();
    expect(setSentryUser).not.toHaveBeenCalled();
  });

  it('calls the handler with the session and route context and returns its response', async () => {
    vi.mocked(getSession).mockResolvedValue(session);
    const handler = vi.fn(async () => NextResponse.json({ ok: true }, { status: 202 }));
    const context = { params: Promise.resolve({ id: 'n1' }) };

    const response = await withAuth(handler)(request, context);

    expect(handler).toHaveBeenCalledWith(request, { session }, context);
    expect(setSentryUser).toHaveBeenCalledWith({ id: 'u1' });
    expect(response.status).toBe(202);
  });

  it('propagates session lookup failures to catchAsync', async () => {
    vi.mocked(getSession).mockRejectedValue(new Error('redis down'));

    await expect(withAuth(vi.fn())(request, undefined)).rejects.toThrow('redis down');
  });
});
