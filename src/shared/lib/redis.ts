import 'server-only';

import Redis from 'ioredis';

import { REDIS_MAX_RETRIES, REDIS_RETRY_DELAY_MS, REDIS_SENTINEL_MASTER_NAME } from '@/shared/constants/redis';
import { env } from '@/shared/lib/env';
import { globalSingleton } from '@/shared/utils/global-singleton';

class RedisClientManager {
  private clientPromise: Promise<Redis> | null = null;

  async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
    const client = await this.getClient();
    if (expirationSeconds) {
      await client.set(key, value, 'EX', expirationSeconds);
      return;
    }
    await client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    const client = await this.getClient();
    return client.get(key);
  }

  async delete(key: string): Promise<void> {
    const client = await this.getClient();
    await client.del(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    const client = await this.getClient();
    await client.expire(key, seconds);
  }

  /** Atomically increments a counter that resets `windowSeconds` after its first hit (rate limiting). */
  async incrementWithWindow(key: string, windowSeconds: number): Promise<number> {
    const client = await this.getClient();
    const replies = await client.multi().set(key, '0', 'EX', windowSeconds, 'NX').incr(key).exec();
    const [, incrementReply] = replies ?? [];
    const [incrementError, count] = incrementReply ?? [new Error('Redis transaction aborted'), null];
    if (incrementError) throw incrementError;
    return Number(count);
  }

  async ping(): Promise<void> {
    const client = await this.getClient();
    await client.ping();
  }

  async closeConnection(): Promise<void> {
    if (!this.clientPromise) return;
    const client = await this.clientPromise;
    this.clientPromise = null;
    await client.quit();
  }

  private getClient(): Promise<Redis> {
    this.clientPromise ??= this.connect(REDIS_MAX_RETRIES).catch((error: unknown) => {
      this.clientPromise = null;
      throw error;
    });
    return this.clientPromise;
  }

  private createClient(): Redis {
    const { REDIS_SENTINELS, REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD } = env.get();
    if (REDIS_SENTINELS) {
      return new Redis({
        sentinels: REDIS_SENTINELS,
        name: REDIS_SENTINEL_MASTER_NAME,
        password: REDIS_PASSWORD,
        sentinelPassword: REDIS_PASSWORD,
      });
    }
    return new Redis({ host: REDIS_HOST, port: REDIS_PORT, username: REDIS_USER, password: REDIS_PASSWORD });
  }

  private async connect(retriesLeft: number): Promise<Redis> {
    const client = this.createClient();
    try {
      await client.ping();
      return client;
    } catch (error) {
      client.disconnect();
      if (retriesLeft <= 0) throw error;
      console.warn(`Redis connection failed, retrying (${REDIS_MAX_RETRIES - retriesLeft + 1}/${REDIS_MAX_RETRIES})`, error);
      await new Promise((resolve) => setTimeout(resolve, REDIS_RETRY_DELAY_MS));
      return this.connect(retriesLeft - 1);
    }
  }
}

export const redis = globalSingleton('redis', () => new RedisClientManager());

export { RedisClientManager };
