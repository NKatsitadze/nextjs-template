import { NextResponse } from 'next/server';

import { checkReadinessService } from '@/shared/service/check-readiness.service';

export const dynamic = 'force-dynamic';

/** Readiness: 200 only when MongoDB and Redis answer. Point load-balancer/k8s readiness probes here. */
export async function GET() {
  const { data, status } = await checkReadinessService();
  return NextResponse.json(data, { status });
}
