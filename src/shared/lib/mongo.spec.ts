import { beforeEach, describe, expect, it, vi } from 'vitest';

const mongoState = vi.hoisted(() => ({
  instances: [] as Array<{ url: string; options: unknown }>,
  connect: vi.fn(),
  close: vi.fn(),
  command: vi.fn(),
  collection: vi.fn((name: string) => ({ collectionName: name })),
  db: vi.fn(),
}));

vi.mock('mongodb', () => ({
  MongoClient: class {
    connect = mongoState.connect;
    close = mongoState.close;
    db = mongoState.db;
    constructor(url: string, options: unknown) {
      mongoState.instances.push({ url, options });
    }
  },
}));

vi.mock('@/shared/constants/mongo', () => ({ MONGO_MAX_RETRIES: 2, MONGO_RETRY_DELAY_MS: 0, MONGO_SERVER_SELECTION_TIMEOUT_MS: 5000 }));

const envState = vi.hoisted(() => ({
  value: { MONGO_URL: 'mongodb://db', MONGO_DB_NAME: 'app' } as Record<string, string | undefined>,
}));
vi.mock('@/shared/lib/env', () => ({ env: { get: () => envState.value } }));

import { MongoClientManager } from './mongo';

describe('MongoClientManager', () => {
  let manager: MongoClientManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mongoState.instances = [];
    mongoState.connect.mockResolvedValue(undefined);
    mongoState.db.mockReturnValue({ collection: mongoState.collection, command: mongoState.command });
    envState.value = { MONGO_URL: 'mongodb://db', MONGO_DB_NAME: 'app' };
    manager = new MongoClientManager();
  });

  it('returns a collection from the configured database', async () => {
    const collection = await manager.getCollection('users');

    expect(mongoState.db).toHaveBeenCalledWith('app');
    expect(collection).toEqual({ collectionName: 'users' });
  });

  it('shares one connection between concurrent callers', async () => {
    await Promise.all([manager.getDb(), manager.getDb(), manager.getCollection('notes')]);

    expect(mongoState.instances).toHaveLength(1);
    expect(mongoState.connect).toHaveBeenCalledTimes(1);
  });

  it('passes credentials only when both user and password are set', async () => {
    envState.value = { ...envState.value, MONGO_USER: 'admin', MONGO_PASSWORD: 'secret' };

    await manager.getDb();

    expect(mongoState.instances[0]).toEqual({
      url: 'mongodb://db',
      options: { serverSelectionTimeoutMS: 5000, auth: { username: 'admin', password: 'secret' } },
    });
  });

  it('omits credentials when they are not configured', async () => {
    await manager.getDb();

    expect(mongoState.instances[0]?.options).toEqual({ serverSelectionTimeoutMS: 5000 });
  });

  it('retries a failed connection and succeeds', async () => {
    mongoState.connect.mockRejectedValueOnce(new Error('ECONNREFUSED')).mockResolvedValueOnce(undefined);

    await expect(manager.getDb()).resolves.toBeDefined();
    expect(mongoState.connect).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting retries and allows a later reconnect', async () => {
    mongoState.connect.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(manager.getDb()).rejects.toThrow('ECONNREFUSED');
    expect(mongoState.connect).toHaveBeenCalledTimes(3);

    mongoState.connect.mockResolvedValue(undefined);
    await expect(manager.getDb()).resolves.toBeDefined();
  });

  it('pings the database', async () => {
    await manager.ping();

    expect(mongoState.command).toHaveBeenCalledWith({ ping: 1 });
  });

  it('closes the client and reconnects on next use', async () => {
    await manager.getDb();
    await manager.closeConnection();

    expect(mongoState.close).toHaveBeenCalledTimes(1);
    await manager.getDb();
    expect(mongoState.instances).toHaveLength(2);
  });

  it('does nothing when closing an unopened connection', async () => {
    await manager.closeConnection();

    expect(mongoState.close).not.toHaveBeenCalled();
  });
});
