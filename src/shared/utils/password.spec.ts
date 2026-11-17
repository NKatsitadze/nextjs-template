import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/constants/password', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/constants/password')>()),
  BCRYPT_COST: 4,
}));

import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('hashes with bcrypt and verifies the original password', async () => {
    const hash = await hashPassword('correct horse');

    expect(hash).toMatch(/^\$2[aby]\$04\$/);
    await expect(verifyPassword('correct horse', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct horse');

    await expect(verifyPassword('battery staple', hash)).resolves.toBe(false);
  });

  it('returns false for a missing user even if the dummy hash were matched', async () => {
    await expect(verifyPassword('anything', null)).resolves.toBe(false);
  });
});
