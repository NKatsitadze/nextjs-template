import { afterEach, describe, expect, it, vi } from 'vitest';

describe('forceNavigate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('navigates and reports that a forced navigation is under way', async () => {
    const location = { href: '/dashboard' };
    vi.stubGlobal('window', { location });
    const { forceNavigate, isForceNavigating } = await import('./force-navigate');

    expect(isForceNavigating()).toBe(false);
    forceNavigate('/sign-in');

    expect(location.href).toBe('/sign-in');
    expect(isForceNavigating()).toBe(true);
  });
});
