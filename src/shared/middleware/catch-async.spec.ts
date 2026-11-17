import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catchAsync } from './catch-async';

function makeRequest(method = 'GET', path = '/api/test') {
  return new Request(`http://localhost${path}`, { method, headers: { 'x-forwarded-for': '1.2.3.4' } });
}

describe('catchAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('returns the handler response and writes an access-log line', async () => {
    const wrapped = catchAsync(async () => NextResponse.json({ ok: true }, { status: 201 }));

    const response = await wrapped(makeRequest('POST', '/api/notes?x=1'), undefined);

    expect(response.status).toBe(201);
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/^1\.2\.3\.4 \[.+\] "POST \/api\/notes\?x=1" 201 /));
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('passes the route context through to the handler', async () => {
    const handler = vi.fn(async () => NextResponse.json({}));
    const context = { params: Promise.resolve({ id: '123' }) };
    const request = makeRequest();

    await catchAsync(handler)(request, context);

    expect(handler).toHaveBeenCalledWith(request, context);
  });

  it('returns 500 and reports unhandled errors to Sentry', async () => {
    const error = new TypeError('db connection refused');
    const wrapped = catchAsync(async () => { throw error; });

    const response = await wrapped(makeRequest('DELETE', '/api/notes/1'), undefined);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'INTERNAL_ERROR' });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('"DELETE /api/notes/1" 500'), error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({
      tags: expect.objectContaining({ source: 'api-route', method: 'DELETE', path: '/api/notes/1', error_type: 'TypeError' }),
      level: 'error',
    }));
  });

  it('tags non-Error throwables as UnknownError', async () => {
    const wrapped = catchAsync(async () => { throw 'boom'; });

    await wrapped(makeRequest(), undefined);

    expect(Sentry.captureException).toHaveBeenCalledWith('boom', expect.objectContaining({
      tags: expect.objectContaining({ error_type: 'UnknownError' }),
    }));
  });
});
