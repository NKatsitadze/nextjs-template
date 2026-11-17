import { describe, expect, it } from 'vitest';

import { getSafeRedirect } from './safe-redirect';

describe('getSafeRedirect', () => {
  it.each([
    ['/notes', '/notes'],
    ['/notes?page=2', '/notes?page=2'],
    [null, '/dashboard'],
    [undefined, '/dashboard'],
    ['', '/dashboard'],
    ['https://evil.example', '/dashboard'],
    ['//evil.example', '/dashboard'],
    ['/\\evil.example', '/dashboard'],
  ])('maps %j to %s', (target, expected) => {
    expect(getSafeRedirect(target)).toBe(expected);
  });
});
