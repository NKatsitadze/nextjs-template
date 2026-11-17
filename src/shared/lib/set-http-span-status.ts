import * as Sentry from '@sentry/nextjs';

import {
  SPAN_STATUS_CANCELLED,
  SPAN_STATUS_ERROR,
  SPAN_STATUS_INTERNAL_ERROR,
} from '@/shared/constants/telemetry';

export function setHttpSpanStatus(span: Sentry.Span | undefined, statusOrError: unknown) {
  if (!span) return;
  if (typeof statusOrError === 'number') {
    Sentry.setHttpStatus(span, statusOrError);
    return;
  }
  const isAborted = statusOrError instanceof Error && statusOrError.name === 'AbortError';
  span.setStatus({
    code: SPAN_STATUS_ERROR,
    message: isAborted ? SPAN_STATUS_CANCELLED : SPAN_STATUS_INTERNAL_ERROR,
  });
}
