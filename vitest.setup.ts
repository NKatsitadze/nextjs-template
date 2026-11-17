import { vi } from 'vitest';

// The real Sentry SDK costs ~140ms per spec to import. Specs that assert on Sentry
// read these stubs via `vi.mocked(Sentry.captureException)`.
vi.mock('@sentry/nextjs', () => {
  const span = { end: vi.fn(), setAttribute: vi.fn(), setStatus: vi.fn() };
  return {
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    captureRequestError: vi.fn(),
    captureRouterTransitionStart: vi.fn(),
    addBreadcrumb: vi.fn(),
    setUser: vi.fn(),
    setTag: vi.fn(),
    setHttpStatus: vi.fn(),
    getTraceData: vi.fn(() => ({})),
    startSpan: vi.fn((_options: unknown, callback: (activeSpan: typeof span) => unknown) => callback(span)),
    startInactiveSpan: vi.fn(() => span),
    browserTracingIntegration: vi.fn(),
    browserProfilingIntegration: vi.fn(),
  };
});
