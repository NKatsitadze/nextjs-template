import { NextResponse } from 'next/server';

import { loginService } from '@/features/auth/service/login.service';
import { SignInSchema } from '@/features/auth/validations/sign-in';
import { catchAsync } from '@/shared/middleware/catch-async';
import { validateBody } from '@/shared/middleware/validate';
import { getClientIp } from '@/shared/utils/request';

export const POST = catchAsync(async (request: Request) => {
  const validation = await validateBody(request, SignInSchema);
  if ('error' in validation) return validation.error;

  const { email, password } = validation.data;
  const { data, status } = await loginService({ email, password, ip: getClientIp(request) });
  return NextResponse.json(data, { status });
});
