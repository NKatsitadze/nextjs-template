import { type StoredUser, type User } from '@/features/auth/types/user';

export function toPublicUser(user: StoredUser): User {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}
