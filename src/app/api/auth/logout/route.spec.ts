import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/service/logout.service', () => ({ logoutService: vi.fn() }));

import { logoutService } from '@/features/auth/service/logout.service';

import { POST } from './route';

const request = new Request('http://localhost/api/auth/logout', { method: 'POST' });

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('returns the service result', async () => {
    vi.mocked(logoutService).mockResolvedValue({ data: { success: true }, status: 200 });

    const response = await POST(request, undefined);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it('returns 500 when the service throws', async () => {
    vi.mocked(logoutService).mockRejectedValue(new Error('redis down'));

    expect((await POST(request, undefined)).status).toBe(500);
  });
});
