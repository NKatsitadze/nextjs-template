import { HEARTBEAT_SPAN_PATTERN } from '@/shared/constants/telemetry';

/** Shared by client and server init. Sentry stays off until NEXT_PUBLIC_SENTRY_DSN is set. */
export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  release: process.env.NEXT_PUBLIC_APP_VERSION || process.env.NEXT_PUBLIC_GIT_HASH || undefined,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) || 0,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  ignoreSpans: [HEARTBEAT_SPAN_PATTERN],
};
