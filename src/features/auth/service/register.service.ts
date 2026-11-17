import 'server-only';

import { userRepository } from '@/features/auth/repository/user';
import { type AuthUserResponse } from '@/features/auth/types/auth';
import { type SignUpType } from '@/features/auth/validations/sign-up';
import { type ServiceResult } from '@/shared/types/common';
import { hashPassword } from '@/shared/utils/password';

export async function registerService({ name, email, password }: SignUpType): Promise<ServiceResult<AuthUserResponse>> {
  const existing = await userRepository.findByEmail(email);
  if (existing) return { data: { error: 'EMAIL_TAKEN' }, status: 409 };

  const now = new Date();
  const passwordHash = await hashPassword(password);
  const role = 'user';
  const id = await userRepository.create({ name, email, passwordHash, role, createdAt: now, updatedAt: now });

  return { data: { user: { id: id.toString(), name, email, role } }, status: 201 };
}
