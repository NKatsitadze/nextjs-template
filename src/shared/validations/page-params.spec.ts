import { describe, expect, it } from 'vitest';

import { PageParamsSchema } from './page-params';

describe('PageParamsSchema', () => {
  it('coerces query-string numbers', () => {
    expect(PageParamsSchema.parse({ page: '3', pageSize: '20' })).toEqual({ page: 3, pageSize: 20 });
  });

  it.each([
    [{}, { page: 1, pageSize: 12 }],
    [{ page: '0', pageSize: '1000' }, { page: 1, pageSize: 12 }],
    [{ page: 'abc', pageSize: '-1' }, { page: 1, pageSize: 12 }],
    [{ page: '2.5' }, { page: 1, pageSize: 12 }],
  ])('falls back to defaults for %o', (input, expected) => {
    expect(PageParamsSchema.parse(input)).toEqual(expected);
  });
});
