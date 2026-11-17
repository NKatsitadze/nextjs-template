import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/user', () => ({ userRepository: { findByEmail: vi.fn(), create: vi.fn() } }));
vi.mock('@/shared/utils/password', () => ({ hashPassword: vi.fn(async () => 'bcrypt-hash') }));

import { userRepository } from '@/features/auth/repository/user';

import { registerService } from './register.service';

const input = { name: 'Ana', email: 'ana@example.com', password: 'secret123' };

describe('registerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
  });

  it('stores a hashed password and returns the new public user', async () => {
    const id = new ObjectId();
    vi.mocked(userRepository.create).mockResolvedValue(id);

    const result = await registerService(input);

    expect(result).toEqual({
      data: { user: { id: id.toString(), name: 'Ana', email: 'ana@example.com', role: 'user' } },
      status: 201,
    });
    expect(userRepository.create).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: 'bcrypt-hash',
      role: 'user',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('returns 409 when the email is taken and does not create a user', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ _id: new ObjectId() } as never);

    await expect(registerService(input)).resolves.toEqual({ data: { error: 'EMAIL_TAKEN' }, status: 409 });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('propagates repository failures', async () => {
    vi.mocked(userRepository.create).mockRejectedValue(new Error('duplicate key'));

    await expect(registerService(input)).rejects.toThrow('duplicate key');
  });
});
