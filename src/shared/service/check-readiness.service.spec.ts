import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({ mongo: { ping: vi.fn() } }));
vi.mock('@/shared/lib/redis', () => ({ redis: { ping: vi.fn() } }));

import { mongo } from '@/shared/lib/mongo';
import { redis } from '@/shared/lib/redis';

import { checkReadinessService } from './check-readiness.service';

describe('checkReadinessService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mongo.ping).mockResolvedValue(undefined);
    vi.mocked(redis.ping).mockResolvedValue(undefined);
  });

  it('is ready when both dependencies answer', async () => {
    await expect(checkReadinessService()).resolves.toEqual({
      data: { status: 'ready', checks: { mongo: 'up', redis: 'up' } },
      status: 200,
    });
  });

  it('treats a dependency that does not answer in time as down', async () => {
    vi.useFakeTimers();
    vi.mocked(mongo.ping).mockReturnValue(new Promise(() => undefined));

    const pending = checkReadinessService();
    await vi.advanceTimersByTimeAsync(2000);

    await expect(pending).resolves.toMatchObject({ data: { checks: { mongo: 'down', redis: 'up' } }, status: 503 });
    vi.useRealTimers();
  });

  it.each([
    ['mongo', () => vi.mocked(mongo.ping).mockRejectedValue(new Error('down')), { mongo: 'down', redis: 'up' }],
    ['redis', () => vi.mocked(redis.ping).mockRejectedValue(new Error('down')), { mongo: 'up', redis: 'down' }],
  ])('returns 503 when %s is down', async (_name, arrange, checks) => {
    arrange();

    await expect(checkReadinessService()).resolves.toEqual({ data: { status: 'unavailable', checks }, status: 503 });
  });
});
