import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatDate, formatDateTime, toIsoWithLocalOffset } from './date';

describe('toIsoWithLocalOffset', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [-240, '+04:00'],
    [0, '+00:00'],
    [330, '-05:30'],
  ])('formats timezone offset %i as %s', (timezoneOffset, expectedOffset) => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(timezoneOffset);

    expect(toIsoWithLocalOffset(new Date(2026, 0, 2, 3, 4, 5))).toBe(`2026-01-02T03:04:05${expectedOffset}`);
  });

  it('accepts strings and timestamps', () => {
    const date = new Date(2026, 10, 17, 9, 0, 0);

    expect(toIsoWithLocalOffset(date.toISOString())).toBe(toIsoWithLocalOffset(date.getTime()));
  });
});

describe('formatDate / formatDateTime', () => {
  const value = new Date(2026, 10, 17, 13, 45);

  it('formats a date', () => {
    expect(formatDate(value)).toBe('Nov 17, 2026');
  });

  it('formats a date with time', () => {
    expect(formatDateTime(value)).toBe('Nov 17, 2026, 01:45 PM');
  });

  it('accepts ISO strings', () => {
    expect(formatDate(value.toISOString())).toBe('Nov 17, 2026');
  });
});
