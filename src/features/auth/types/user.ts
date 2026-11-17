import { type WithId } from 'mongodb';

export type UserRole = 'user' | 'admin';

/** Shape stored in the `users` collection (Mongo adds `_id`; reads return `WithId<UserDocument>`). */
export type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type StoredUser = WithId<UserDocument>;

/** Public user shape — safe to send to the client and keep in the session. */
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
