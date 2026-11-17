import * as Sentry from '@sentry/nextjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  addSentryBreadcrumb,
  clearSentryUser,
  reportBoundaryError,
  sendClientErrorToSentry,
  sendHttpErrorToSentry,
  sendServerErrorToSentry,
  setSentryUser,
  startHttpSpan,
} from './sentry';

describe('sentry helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets the user in Sentry', () => {
    setSentryUser({ id: '123', email: 'user@test.com', username: 'test' });

    expect(Sentry.setUser).toHaveBeenCalledWith({
      id: '123',
      email: 'user@test.com',
      username: 'test',
    });
  });

  it('clears the Sentry user', () => {
    clearSentryUser();

    expect(Sentry.setUser).toHaveBeenCalledWith(null);
  });

  it('adds a breadcrumb', () => {
    addSentryBreadcrumb('action', { key: 'value' });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: 'action',
      data: { key: 'value' },
      level: 'info',
    });
  });

  it('captures HTTP errors with context', () => {
    const error = new Error('Request failed');

    sendHttpErrorToSentry(error, {
      endpoint: '/users',
      method: 'GET',
      url: '/api/users',
      status: 500,
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: {
        source: 'http-client',
        endpoint: '/users',
        method: 'GET',
        status_code: 500,
      },
      contexts: {
        http: {
          url: '/api/users',
          method: 'GET',
          endpoint: '/users',
          status_code: 500,
        },
      },
      level: 'error',
    });
  });

  it('captures client errors with source, reason and details', () => {
    const error = new Error('video call failed');

    sendClientErrorToSentry(error, {
      source: 'video-call',
      reason: 'media-device-not-found',
      details: { error: 'NotFoundError: Requested device not found' },
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: {
        source: 'video-call',
        reason: 'media-device-not-found',
      },
      contexts: {
        client: {
          source: 'video-call',
          reason: 'media-device-not-found',
          error: 'NotFoundError: Requested device not found',
        },
      },
      level: 'error',
    });
  });

  it('captures handled server errors with source and extra tags', () => {
    const error = new Error('logging failed');

    sendServerErrorToSentry(error, { source: 'activity-log', tags: { module: 'users' } });

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { module: 'users', source: 'activity-log' },
      level: 'error',
    });
  });

  it('reports boundary errors with source and error type', () => {
    const error = new TypeError('render failed');

    reportBoundaryError(error, 'route-error-boundary');

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: {
        source: 'route-error-boundary',
        error_type: 'TypeError',
      },
      level: 'error',
    });
  });

  it('falls back to UnknownError for non-Error boundary values', () => {
    reportBoundaryError('boom', 'global-error-boundary');

    expect(Sentry.captureException).toHaveBeenCalledWith('boom', {
      tags: {
        source: 'global-error-boundary',
        error_type: 'UnknownError',
      },
      level: 'error',
    });
  });

  it('starts an HTTP span', () => {
    const span = { end: vi.fn() } as unknown as Sentry.Span;
    vi.mocked(Sentry.startInactiveSpan).mockReturnValue(span);

    const result = startHttpSpan('POST', '/login', '/api/login');

    expect(Sentry.startInactiveSpan).toHaveBeenCalledWith({
      name: 'POST /login',
      op: 'http.client',
      onlyIfParent: true,
      attributes: {
        'http.method': 'POST',
        'http.url': '/api/login',
        'http.endpoint': '/login',
      },
    });
    expect(result).toBe(span);
  });
});
