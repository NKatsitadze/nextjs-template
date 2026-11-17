import { NextResponse } from 'next/server';

import { registerService } from '@/features/auth/service/register.service';
import { SignUpSchema } from '@/features/auth/validations/sign-up';
import { catchAsync } from '@/shared/middleware/catch-async';
import { validateBody } from '@/shared/middleware/validate';

export const POST = catchAsync(async (request: Request) => {
  const validation = await validateBody(request, SignUpSchema);
  if ('error' in validation) return validation.error;

  const { data, status } = await registerService(validation.data);
  return NextResponse.json(data, { status });
});
