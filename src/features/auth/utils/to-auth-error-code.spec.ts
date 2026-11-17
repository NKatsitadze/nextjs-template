import { describe, expect, it } from 'vitest';

import { toAuthErrorCode } from './to-auth-error-code';

function httpError(code?: string) {
  return Object.assign(new Error(code ?? 'x'), { code, status: 400 });
}

describe('toAuthErrorCode', () => {
  it.each(['LOGIN_INVALID', 'RATE_LIMITED', 'EMAIL_TAKEN', 'VALIDATION_ERROR'])('keeps known code %s', (code) => {
    expect(toAuthErrorCode(httpError(code))).toBe(code);
  });

  it.each([
    ['an unknown API code', httpError('SOMETHING_ELSE')],
    ['an HTTP error without a code', httpError()],
    ['a network error', new TypeError('Failed to fetch')],
    ['a non-error value', 'boom'],
  ])('falls back to UNKNOWN for %s', (_case, error) => {
    expect(toAuthErrorCode(error)).toBe('UNKNOWN');
  });
});
