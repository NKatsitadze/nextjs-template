import bcrypt from 'bcryptjs';

import { BCRYPT_COST, DUMMY_PASSWORD_HASH } from '@/shared/constants/password';

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/** Pass `null` when the user does not exist: the comparison still runs, so timing does not leak it. */
export async function verifyPassword(password: string, passwordHash: string | null): Promise<boolean> {
  const matches = await bcrypt.compare(password, passwordHash ?? DUMMY_PASSWORD_HASH);
  return passwordHash !== null && matches;
}
