import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./sentry', () => ({
  sendHttpErrorToSentry: vi.fn(),
  startHttpSpan: vi.fn(() => ({ end: vi.fn() })),
}));
vi.mock('@/shared/lib/set-http-span-status', () => ({ setHttpSpanStatus: vi.fn() }));
vi.mock('./force-navigate', () => ({ forceNavigate: vi.fn() }));

import { forceNavigate } from './force-navigate';
import { HttpClient, isHttpError } from './http';
import { sendHttpErrorToSentry } from './sentry';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function lastFetchInit(): RequestInit & { headers: Headers } {
  return fetchMock.mock.lastCall?.[1] as RequestInit & { headers: Headers };
}

describe('HttpClient', () => {
  const client = new HttpClient('/api');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', { location: { pathname: '/dashboard' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GETs JSON with query params, skipping undefined values', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    const result = await client.get('/notes', { params: { page: 2, search: undefined, archived: false } });

    expect(result).toEqual({ ok: true });
    expect(fetchMock.mock.lastCall?.[0]).toBe('/api/notes?page=2&archived=false');
    expect(lastFetchInit().method).toBe('GET');
  });

  it.each(['post', 'put', 'patch'] as const)('%s serializes the body as JSON', async (method) => {
    fetchMock.mockResolvedValue(jsonResponse({ id: '1' }));

    await client[method]('/notes', { title: 'Hello' });

    expect(lastFetchInit().body).toBe('{"title":"Hello"}');
    expect(lastFetchInit().headers.get('Content-Type')).toBe('application/json');
  });

  it('sends FormData as-is without a JSON content type', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    const formData = new FormData();

    await client.post('/upload', formData);

    expect(lastFetchInit().body).toBe(formData);
    expect(lastFetchInit().headers.has('Content-Type')).toBe(false);
  });

  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(client.delete('/notes/1')).resolves.toBeUndefined();
  });

  it.each([
    ['text', new Response('plain'), 'plain'],
    ['blob', new Response('bytes'), expect.any(Blob)],
  ] as const)('parses %s responses', async (responseType, response, expected) => {
    fetchMock.mockResolvedValue(response);

    await expect(client.get('/file', { responseType })).resolves.toEqual(expected);
  });

  it('uses a per-request base URL override', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await client.get('/health', { baseUrl: '' });

    expect(fetchMock.mock.lastCall?.[0]).toBe('/health');
  });

  it('throws an HttpError with the API error code and reports it', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'NOT_FOUND' }, 404));

    const error: unknown = await client.get('/notes/x').catch((caught: unknown) => caught);

    expect(isHttpError(error) && error.code).toBe('NOT_FOUND');
    expect(isHttpError(error) && error.status).toBe(404);
    expect(sendHttpErrorToSentry).toHaveBeenCalledWith(error, expect.objectContaining({ status: 404 }));
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

    await expect(client.get('/x')).rejects.toThrow('HTTP Error: 502');
  });

  it('redirects to sign-in on 401 without reporting to Sentry', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'UNAUTHORIZED' }, 401));

    await expect(client.get('/notes')).rejects.toThrow('UNAUTHORIZED');

    expect(forceNavigate).toHaveBeenCalledWith('/sign-in');
    expect(sendHttpErrorToSentry).not.toHaveBeenCalled();
  });

  it('does not redirect on 401 while already on an auth page', async () => {
    vi.stubGlobal('window', { location: { pathname: '/sign-in' } });
    fetchMock.mockResolvedValue(jsonResponse({ error: 'LOGIN_INVALID' }, 401));

    await expect(client.post('/auth/login', {})).rejects.toThrow('LOGIN_INVALID');

    expect(forceNavigate).not.toHaveBeenCalled();
  });

  it('reports network failures and rethrows them', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetchMock.mockRejectedValue(networkError);

    await expect(client.get('/x')).rejects.toBe(networkError);

    expect(sendHttpErrorToSentry).toHaveBeenCalledWith(networkError, expect.objectContaining({ endpoint: '/x' }));
  });

  it('does not report aborted requests', async () => {
    fetchMock.mockRejectedValue(new DOMException('aborted', 'AbortError'));

    await expect(client.get('/x')).rejects.toThrow('aborted');

    expect(sendHttpErrorToSentry).not.toHaveBeenCalled();
  });

  it('wraps non-Error rejections', async () => {
    fetchMock.mockRejectedValue('weird');

    await expect(client.get('/x')).rejects.toThrow('An unexpected error occurred');
  });
});
