import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/service/check-readiness.service', () => ({ checkReadinessService: vi.fn() }));

import { checkReadinessService } from '@/shared/service/check-readiness.service';

import { GET } from './route';

describe('GET /api/ready', () => {
  it.each([200, 503])('returns the readiness result with status %i', async (status) => {
    const data = { status: status === 200 ? 'ready' : 'unavailable', checks: { mongo: 'up', redis: 'up' } } as const;
    vi.mocked(checkReadinessService).mockResolvedValue({ data, status });

    const response = await GET();

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual(data);
  });
});
