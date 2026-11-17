import 'server-only';

import { mongo } from '@/shared/lib/mongo';
import { redis } from '@/shared/lib/redis';
import { type ServiceResult } from '@/shared/types/common';
import { withTimeout } from '@/shared/utils/with-timeout';

// Probes must answer quickly; a dependency slower than this counts as down.
const READINESS_TIMEOUT_MS = 2000;

type DependencyStatus = 'up' | 'down';

type ReadinessResponse = {
  status: 'ready' | 'unavailable';
  checks: { mongo: DependencyStatus; redis: DependencyStatus };
};

const toStatus = (result: PromiseSettledResult<unknown>): DependencyStatus => (result.status === 'fulfilled' ? 'up' : 'down');

export async function checkReadinessService(): Promise<ServiceResult<ReadinessResponse>> {
  const [mongoResult, redisResult] = await Promise.allSettled([
    withTimeout(mongo.ping(), READINESS_TIMEOUT_MS),
    withTimeout(redis.ping(), READINESS_TIMEOUT_MS),
  ]);
  const checks = { mongo: toStatus(mongoResult), redis: toStatus(redisResult) };
  const ready = checks.mongo === 'up' && checks.redis === 'up';

  return { data: { status: ready ? 'ready' : 'unavailable', checks }, status: ready ? 200 : 503 };
}
