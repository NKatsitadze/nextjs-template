import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/force-navigate', () => ({ isForceNavigating: vi.fn(() => false) }));

import { isForceNavigating } from '@/shared/lib/force-navigate';

import { getErrorMessage } from './error-message';

describe('getErrorMessage', () => {
  beforeEach(() => {
    vi.mocked(isForceNavigating).mockReturnValue(false);
  });

  it.each([
    [new Error('NOT_FOUND'), 'NOT_FOUND'],
    [new Error(''), 'Fallback'],
    ['boom', 'Fallback'],
  ])('maps %o to %s', (error, expected) => {
    expect(getErrorMessage(error, 'Fallback')).toBe(expected);
  });

  it('returns null while a forced navigation is under way', () => {
    vi.mocked(isForceNavigating).mockReturnValue(true);

    expect(getErrorMessage(new Error('UNAUTHORIZED'), 'Fallback')).toBeNull();
  });
});
