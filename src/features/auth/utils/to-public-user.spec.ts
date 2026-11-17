import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

import { toPublicUser } from './to-public-user';

describe('toPublicUser', () => {
  it('drops the password hash and timestamps and stringifies the id', () => {
    const id = new ObjectId();
    const stored = {
      _id: id,
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: 'secret-hash',
      role: 'admin' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(toPublicUser(stored)).toEqual({ id: id.toString(), name: 'Ana', email: 'ana@example.com', role: 'admin' });
  });
});
