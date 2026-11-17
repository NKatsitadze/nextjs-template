import { describe, expect, it } from 'vitest';

import { getClientIp, isTrustedOrigin } from './request';

function makeRequest(method: string, headers: Record<string, string> = {}) {
  return new Request('http://app.local/api/notes', { method, headers });
}

describe('getClientIp', () => {
  it.each([
    [{ 'x-forwarded-for': '1.1.1.1, 10.0.0.1' }, '1.1.1.1'],
    [{ 'x-real-ip': '2.2.2.2' }, '2.2.2.2'],
    [{}, '-'],
  ])('reads %o as %s', (headers, expected) => {
    expect(getClientIp(makeRequest('GET', headers))).toBe(expected);
  });
});

describe('isTrustedOrigin', () => {
  it.each(['GET', 'HEAD', 'OPTIONS'])('always trusts safe method %s', (method) => {
    expect(isTrustedOrigin(makeRequest(method, { origin: 'https://evil.example' }))).toBe(true);
  });

  it('trusts writes without an Origin header (non-browser clients)', () => {
    expect(isTrustedOrigin(makeRequest('POST'))).toBe(true);
  });

  it.each([
    [{ origin: 'http://app.local', host: 'app.local' }, true],
    [{ origin: 'https://app.example', 'x-forwarded-host': 'app.example', host: 'internal:8080' }, true],
    [{ origin: 'https://evil.example', host: 'app.local' }, false],
    [{ origin: 'null', host: 'app.local' }, false],
  ])('checks origin against host for %o', (headers, expected) => {
    expect(isTrustedOrigin(makeRequest('POST', headers))).toBe(expected);
  });

  it('falls back to the request URL host', () => {
    expect(isTrustedOrigin(makeRequest('DELETE', { origin: 'http://app.local' }))).toBe(true);
  });
});
