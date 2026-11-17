import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/jose', () => ({ verifyToken: vi.fn() }));

import { verifyToken } from '@/shared/lib/jose';

import { proxy } from './proxy';

function makeRequest(path: string, init: { method?: string; headers?: Record<string, string> } = {}) {
  return new NextRequest(`http://app.local${path}`, { method: init.method ?? 'GET', headers: { host: 'app.local', ...init.headers } });
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API requests', () => {
    it('lets same-origin writes through', async () => {
      const response = await proxy(makeRequest('/api/notes', { method: 'POST', headers: { origin: 'http://app.local' } }));

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('rejects cross-origin writes with 403 CSRF_INVALID', async () => {
      const response = await proxy(makeRequest('/api/notes', { method: 'POST', headers: { origin: 'https://evil.example' } }));

      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toEqual({ error: 'CSRF_INVALID' });
    });

    it('never verifies tokens for API calls (withAuth does that)', async () => {
      await proxy(makeRequest('/api/notes', { headers: { cookie: 'accessToken=jwt' } }));

      expect(verifyToken).not.toHaveBeenCalled();
    });
  });

  describe('pages', () => {
    it.each(['/', '/sign-in', '/dashboards-public'])('lets public page %s through', async (path) => {
      const response = await proxy(makeRequest(path));

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('redirects a protected page to sign-in with a callback when there is no cookie', async () => {
      const response = await proxy(makeRequest('/notes/abc?tab=1'));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://app.local/sign-in?callbackUrl=%2Fnotes%2Fabc%3Ftab%3D1');
    });

    it('redirects when the token is invalid or expired', async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);

      const response = await proxy(makeRequest('/dashboard', { headers: { cookie: 'accessToken=bad' } }));

      expect(verifyToken).toHaveBeenCalledWith('bad');
      expect(response.status).toBe(307);
    });

    it('lets a protected page through with a valid token', async () => {
      vi.mocked(verifyToken).mockResolvedValue({ sessionId: 'sid' });

      const response = await proxy(makeRequest('/dashboard', { headers: { cookie: 'accessToken=jwt' } }));

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });
});
