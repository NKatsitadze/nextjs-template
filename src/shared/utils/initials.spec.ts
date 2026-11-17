import { describe, expect, it } from 'vitest';

import { getInitials } from './initials';

describe('getInitials', () => {
  it.each([
    ['Ana Maria Smith', 'AM'],
    ['ana', 'A'],
    ['  ana   smith ', 'AS'],
    ['', 'U'],
  ])('maps %j to %s', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
