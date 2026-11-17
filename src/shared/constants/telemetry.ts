export const SPAN_STATUS_ERROR = 2;
export const SPAN_STATUS_CANCELLED = 'cancelled';
export const SPAN_STATUS_INTERNAL_ERROR = 'internal_error';

// Requests that fire on a timer would otherwise flood tracing with identical spans.
export const HEARTBEAT_SPAN_PATTERN = /\/api\/(health|ready)$/;
