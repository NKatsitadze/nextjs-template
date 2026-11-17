import 'server-only';

import { redis } from '@/shared/lib/redis';

const attemptsKey = (ip: string, email: string) => `login-attempts:${ip}:${email}`;

export const loginAttemptsRepository = {
  async increment(ip: string, email: string, windowSeconds: number): Promise<number> {
    return redis.incrementWithWindow(attemptsKey(ip, email), windowSeconds);
  },

  async reset(ip: string, email: string): Promise<void> {
    await redis.delete(attemptsKey(ip, email));
  },
};
