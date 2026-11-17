import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/middleware/validate', () => ({
  validateBody: vi.fn(async (request: Request) => ({ data: (await request.json()) as unknown })),
}));
vi.mock('@/features/auth/service/register.service', () => ({ registerService: vi.fn() }));

import { registerService } from '@/features/auth/service/register.service';
import { validateBody } from '@/shared/middleware/validate';

import { POST } from './route';

const body = { name: 'Ana', email: 'ana@example.com', password: 'secret123' };

function makeRequest() {
  return new Request('http://localhost/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('creates the user and returns 201', async () => {
    const user = { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'user' as const };
    vi.mocked(registerService).mockResolvedValue({ data: { user }, status: 201 });

    const response = await POST(makeRequest(), undefined);

    expect(registerService).toHaveBeenCalledWith(body);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ user });
  });

  it('passes a 409 through', async () => {
    vi.mocked(registerService).mockResolvedValue({ data: { error: 'EMAIL_TAKEN' }, status: 409 });

    const response = await POST(makeRequest(), undefined);

    expect(response.status).toBe(409);
  });

  it('returns the validation error without calling the service', async () => {
    vi.mocked(validateBody).mockResolvedValueOnce({ error: NextResponse.json({}, { status: 400 }) });

    const response = await POST(makeRequest(), undefined);

    expect(response.status).toBe(400);
    expect(registerService).not.toHaveBeenCalled();
  });

  it('returns 500 when the service throws', async () => {
    vi.mocked(registerService).mockRejectedValue(new Error('mongo down'));

    expect((await POST(makeRequest(), undefined)).status).toBe(500);
  });
});
