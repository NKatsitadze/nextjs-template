import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisState = vi.hoisted(() => ({
  options: [] as unknown[],
  multiReplies: [[null, 'OK'], [null, 1]] as unknown[] | null,
  multiCalls: [] as unknown[][],
  ping: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
  expire: vi.fn(),
  quit: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('ioredis', () => ({
  default: class {
    ping = redisState.ping;
    set = redisState.set;
    get = redisState.get;
    del = redisState.del;
    expire = redisState.expire;
    quit = redisState.quit;
    disconnect = redisState.disconnect;
    multi = () => {
      const chain = {
        set: (...args: unknown[]) => { redisState.multiCalls.push(['set', ...args]); return chain; },
        incr: (...args: unknown[]) => { redisState.multiCalls.push(['incr', ...args]); return chain; },
        exec: async () => redisState.multiReplies,
      };
      return chain;
    };
    constructor(options: unknown) {
      redisState.options.push(options);
    }
  },
}));

vi.mock('@/shared/constants/redis', () => ({
  REDIS_MAX_RETRIES: 1,
  REDIS_RETRY_DELAY_MS: 0,
  REDIS_SENTINEL_MASTER_NAME: 'mymaster',
}));

const envState = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock('@/shared/lib/env', () => ({ env: { get: () => envState.value } }));

import { RedisClientManager } from './redis';

describe('RedisClientManager', () => {
  let manager: RedisClientManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    redisState.options = [];
    redisState.multiCalls = [];
    redisState.multiReplies = [[null, 'OK'], [null, 1]];
    redisState.ping.mockResolvedValue('PONG');
    redisState.get.mockResolvedValue(null);
    envState.value = { REDIS_HOST: 'localhost', REDIS_PORT: 6379, REDIS_PASSWORD: 'pw' };
    manager = new RedisClientManager();
  });

  it('connects to a single host', async () => {
    await manager.get('key');

    expect(redisState.options).toEqual([{ host: 'localhost', port: 6379, username: undefined, password: 'pw' }]);
  });

  it('connects through sentinels when configured', async () => {
    envState.value = { ...envState.value, REDIS_SENTINELS: [{ host: 's1', port: 26379 }] };

    await manager.ping();

    expect(redisState.options[0]).toMatchObject({ sentinels: [{ host: 's1', port: 26379 }], name: 'mymaster' });
  });

  it.each([
    [undefined, ['key', 'value']],
    [60, ['key', 'value', 'EX', 60]],
  ])('sets a value with expiration %s', async (expiration, expectedArgs) => {
    await manager.set('key', 'value', expiration);

    expect(redisState.set).toHaveBeenCalledWith(...expectedArgs);
  });

  it('gets, deletes and expires keys', async () => {
    redisState.get.mockResolvedValue('stored');

    await expect(manager.get('key')).resolves.toBe('stored');
    await manager.delete('key');
    await manager.expire('key', 30);

    expect(redisState.del).toHaveBeenCalledWith('key');
    expect(redisState.expire).toHaveBeenCalledWith('key', 30);
  });

  it('retries a failed connection, then gives up and allows a later reconnect', async () => {
    redisState.ping.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(manager.get('key')).rejects.toThrow('ECONNREFUSED');
    expect(redisState.options).toHaveLength(2);
    expect(redisState.disconnect).toHaveBeenCalledTimes(2);

    redisState.ping.mockResolvedValue('PONG');
    await expect(manager.get('key')).resolves.toBeNull();
  });

  describe('incrementWithWindow', () => {
    it('sets the window only for a new key, then increments atomically', async () => {
      await expect(manager.incrementWithWindow('rate', 600)).resolves.toBe(1);

      expect(redisState.multiCalls).toEqual([['set', 'rate', '0', 'EX', 600, 'NX'], ['incr', 'rate']]);
    });

    it('returns the running count for an existing key', async () => {
      redisState.multiReplies = [[null, null], [null, 4]];

      await expect(manager.incrementWithWindow('rate', 600)).resolves.toBe(4);
    });

    it.each([
      ['the increment fails', [[null, 'OK'], [new Error('WRONGTYPE'), null]], 'WRONGTYPE'],
      ['the transaction is aborted', null, 'Redis transaction aborted'],
    ])('throws when %s', async (_case, replies, message) => {
      redisState.multiReplies = replies;

      await expect(manager.incrementWithWindow('rate', 600)).rejects.toThrow(message);
    });
  });

  it('quits the client on close and is a no-op when never opened', async () => {
    await manager.closeConnection();
    expect(redisState.quit).not.toHaveBeenCalled();

    await manager.ping();
    await manager.closeConnection();
    expect(redisState.quit).toHaveBeenCalledTimes(1);
  });
});
