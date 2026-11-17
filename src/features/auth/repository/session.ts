import 'server-only';

import { type SessionData } from '@/features/auth/types/auth';
import { redis } from '@/shared/lib/redis';

const sessionKey = (sessionId: string) => `session:${sessionId}`;

export const sessionRepository = {
  async save(session: SessionData, ttlSeconds: number): Promise<void> {
    await redis.set(sessionKey(session.sessionId), JSON.stringify(session), ttlSeconds);
  },

  async find(sessionId: string): Promise<SessionData | null> {
    const raw = await redis.get(sessionKey(sessionId));
    return raw ? (JSON.parse(raw) as SessionData) : null;
  },

  async touch(sessionId: string, ttlSeconds: number): Promise<void> {
    await redis.expire(sessionKey(sessionId), ttlSeconds);
  },

  async delete(sessionId: string): Promise<void> {
    await redis.delete(sessionKey(sessionId));
  },
};
