import * as Sentry from '@sentry/nextjs';

export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

export function addSentryBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
}

export function sendHttpErrorToSentry(
  error: unknown,
  context: {
    endpoint: string;
    method: string;
    url: string;
    status?: number;
  }
) {
  Sentry.captureException(error, {
    tags: {
      source: 'http-client',
      endpoint: context.endpoint,
      method: context.method,
      status_code: context.status,
    },
    contexts: {
      http: {
        url: context.url,
        method: context.method,
        endpoint: context.endpoint,
        status_code: context.status,
      },
    },
    level: 'error',
  });
}

export function reportBoundaryError(error: unknown, source: string) {
  Sentry.captureException(error, {
    tags: {
      source,
      error_type: error instanceof Error ? error.name : 'UnknownError',
    },
    level: 'error',
  });
}

export function sendClientErrorToSentry(
  error: unknown,
  context: {
    source: string;
    reason?: string;
    details?: Record<string, unknown>;
  },
) {
  Sentry.captureException(error, {
    tags: {
      source: context.source,
      reason: context.reason,
    },
    contexts: {
      client: {
        source: context.source,
        reason: context.reason,
        ...context.details,
      },
    },
    level: 'error',
  });
}

export function sendServerErrorToSentry(
  error: unknown,
  context: {
    source: string;
    tags?: Record<string, string>;
  },
) {
  Sentry.captureException(error, {
    tags: {
      ...context.tags,
      source: context.source,
    },
    level: 'error',
  });
}

export function startHttpSpan(method: string, endpoint: string, url: string) {
  return Sentry.startInactiveSpan({
    name: `${method} ${endpoint}`,
    op: 'http.client',
    onlyIfParent: true,
    attributes: {
      'http.method': method,
      'http.url': url,
      'http.endpoint': endpoint,
    },
  });
}
