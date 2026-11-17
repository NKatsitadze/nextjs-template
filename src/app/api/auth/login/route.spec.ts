import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/middleware/validate', () => ({
  validateBody: vi.fn(async (request: Request) => ({ data: (await request.json()) as unknown })),
}));
vi.mock('@/features/auth/service/login.service', () => ({ loginService: vi.fn() }));

import { loginService } from '@/features/auth/service/login.service';
import { validateBody } from '@/shared/middleware/validate';

import { POST } from './route';

const credentials = { email: 'ana@example.com', password: 'secret123' };

function makeRequest() {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'x-forwarded-for': '9.9.9.9' },
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('passes credentials and client IP to the service and returns its result', async () => {
    const user = { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'user' as const };
    vi.mocked(loginService).mockResolvedValue({ data: { user }, status: 200 });

    const response = await POST(makeRequest(), undefined);

    expect(loginService).toHaveBeenCalledWith({ ...credentials, ip: '9.9.9.9' });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ user });
  });

  it.each([
    [{ error: 'LOGIN_INVALID' }, 401],
    [{ error: 'RATE_LIMITED' }, 429],
  ])('passes service error %o through with status %i', async (data, status) => {
    vi.mocked(loginService).mockResolvedValue({ data, status });

    const response = await POST(makeRequest(), undefined);

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual(data);
  });

  it('returns the validation error without calling the service', async () => {
    const error = NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    vi.mocked(validateBody).mockResolvedValueOnce({ error });

    const response = await POST(makeRequest(), undefined);

    expect(response.status).toBe(400);
    expect(loginService).not.toHaveBeenCalled();
  });

  it('returns 500 when the service throws', async () => {
    vi.mocked(loginService).mockRejectedValue(new Error('redis down'));

    const response = await POST(makeRequest(), undefined);

    expect(response.status).toBe(500);
  });
});
