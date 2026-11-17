import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { env } from './env';

const VALID_ENV = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  JWT_SECRET: 'x'.repeat(32),
  MONGO_URL: 'mongodb://localhost:27017',
  MONGO_DB_NAME: 'app',
};

describe('env', () => {
  beforeEach(() => {
    env.reset();
    for (const [key, value] of Object.entries(VALID_ENV)) vi.stubEnv(key, value);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('parses a valid environment and applies defaults', () => {
    vi.stubEnv('REDIS_PORT', '');

    expect(env.get()).toMatchObject({ ...VALID_ENV, REDIS_HOST: 'localhost', REDIS_PORT: 6379 });
  });

  it('caches the parsed value until reset', () => {
    const first = env.get();
    vi.stubEnv('MONGO_DB_NAME', 'other');

    expect(env.get()).toBe(first);
    env.reset();
    expect(env.get().MONGO_DB_NAME).toBe('other');
  });

  it('treats empty optional values as undefined', () => {
    vi.stubEnv('MONGO_USER', '');
    vi.stubEnv('REDIS_SENTINELS', '');

    expect(env.get().MONGO_USER).toBeUndefined();
    expect(env.get().REDIS_SENTINELS).toBeUndefined();
  });

  it('parses redis sentinels JSON', () => {
    vi.stubEnv('REDIS_SENTINELS', '[{"host":"sentinel","port":"26379"}]');

    expect(env.get().REDIS_SENTINELS).toEqual([{ host: 'sentinel', port: 26379 }]);
  });

  it.each([
    ['JWT_SECRET', 'too-short', 'JWT_SECRET'],
    ['NEXT_PUBLIC_APP_URL', 'not-a-url', 'NEXT_PUBLIC_APP_URL'],
    ['MONGO_URL', '', 'MONGO_URL'],
    ['REDIS_SENTINELS', '{broken', 'REDIS_SENTINELS'],
  ])('throws listing %s when it is invalid', (key, value, expected) => {
    vi.stubEnv(key, value);

    expect(() => env.get()).toThrow(expected);
  });
});
