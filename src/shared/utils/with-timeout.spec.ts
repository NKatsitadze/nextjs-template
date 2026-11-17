import { afterEach, describe, expect, it, vi } from 'vitest';

import { withTimeout } from './with-timeout';

describe('withTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with the value when the promise settles in time', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 100)).resolves.toBe('ok');
  });

  it('passes the original rejection through', async () => {
    await expect(withTimeout(Promise.reject(new Error('boom')), 100)).rejects.toThrow('boom');
  });

  it('rejects with TimeoutError when the promise is too slow', async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise(() => undefined), 3000);
    const assertion = expect(pending).rejects.toMatchObject({ name: 'TimeoutError', message: 'Timed out after 3000ms' });

    await vi.advanceTimersByTimeAsync(3000);

    await assertion;
  });
});
