import 'server-only';

import { type ObjectId } from 'mongodb';

import { type StoredUser, type UserDocument } from '@/features/auth/types/user';
import { mongo } from '@/shared/lib/mongo';

const users = () => mongo.getCollection<UserDocument>('users');

export const userRepository = {
  async findByEmail(email: string): Promise<StoredUser | null> {
    return (await users()).findOne({ email });
  },

  async create(user: UserDocument): Promise<ObjectId> {
    const { insertedId } = await (await users()).insertOne(user);
    return insertedId;
  },

  async ensureIndexes(): Promise<void> {
    await (await users()).createIndex({ email: 1 }, { unique: true });
  },
};
