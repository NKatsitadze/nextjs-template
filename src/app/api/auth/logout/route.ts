import { NextResponse } from 'next/server';

import { logoutService } from '@/features/auth/service/logout.service';
import { catchAsync } from '@/shared/middleware/catch-async';

export const POST = catchAsync(async () => {
  const { data, status } = await logoutService();
  return NextResponse.json(data, { status });
});
