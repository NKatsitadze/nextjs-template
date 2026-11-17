import { afterEach, describe, expect, it, vi } from 'vitest';

import { globalSingleton } from './global-singleton';

describe('globalSingleton', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reuses the instance for the same key outside production', () => {
    const create = vi.fn(() => ({}));

    const first = globalSingleton('spec-reuse', create);
    const second = globalSingleton('spec-reuse', create);

    expect(second).toBe(first);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('keeps separate instances per key', () => {
    expect(globalSingleton('spec-a', () => ({}))).not.toBe(globalSingleton('spec-b', () => ({})));
  });

  it('creates a fresh instance in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const create = vi.fn(() => ({}));

    globalSingleton('spec-prod', create);
    globalSingleton('spec-prod', create);

    expect(create).toHaveBeenCalledTimes(2);
  });
});
