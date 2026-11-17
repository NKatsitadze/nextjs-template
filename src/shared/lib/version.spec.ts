import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadVersion(env: { version?: string; hash?: string }) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_APP_VERSION', env.version ?? '');
  vi.stubEnv('NEXT_PUBLIC_GIT_HASH', env.hash ?? '');
  if (env.version === undefined) delete process.env.NEXT_PUBLIC_APP_VERSION;
  if (env.hash === undefined) delete process.env.NEXT_PUBLIC_GIT_HASH;
  return import('./version');
}

describe('version', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exposes the version and build hash', async () => {
    const { appVersion, gitHash, displayVersion } = await loadVersion({ version: '0.9.8', hash: '3f9c1ab' });
    expect(appVersion).toBe('0.9.8');
    expect(gitHash).toBe('3f9c1ab');
    expect(displayVersion).toBe('Version 0.9.8 (3f9c1ab)');
  });

  it('omits the hash when it is empty', async () => {
    const { gitHash, displayVersion } = await loadVersion({ version: '1.0.0', hash: '' });
    expect(gitHash).toBe('');
    expect(displayVersion).toBe('Version 1.0.0');
  });

  it('falls back to 0.0.0 when no version is set', async () => {
    const { appVersion, displayVersion } = await loadVersion({});
    expect(appVersion).toBe('0.0.0');
    expect(displayVersion).toBe('Version 0.0.0');
  });
});
