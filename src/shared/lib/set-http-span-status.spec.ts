import * as Sentry from '@sentry/nextjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { setHttpSpanStatus } from '@/shared/lib/set-http-span-status';

describe('setHttpSpanStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createSpan = () => ({ setStatus: vi.fn() }) as unknown as Sentry.Span;

  it('sets the status from the HTTP response code', () => {
    const span = createSpan();
    setHttpSpanStatus(span, 404);

    expect(Sentry.setHttpStatus).toHaveBeenCalledWith(span, 404);
  });

  it('marks aborted requests as cancelled', () => {
    const span = createSpan();
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    setHttpSpanStatus(span, abortError);

    expect(span.setStatus).toHaveBeenCalledWith({ code: 2, message: 'cancelled' });
  });

  it('marks network failures as internal_error', () => {
    const span = createSpan();
    setHttpSpanStatus(span, new TypeError('Failed to fetch'));

    expect(span.setStatus).toHaveBeenCalledWith({ code: 2, message: 'internal_error' });
  });

  it('does nothing when no span was started', () => {
    setHttpSpanStatus(undefined, 200);

    expect(Sentry.setHttpStatus).not.toHaveBeenCalled();
  });
});
