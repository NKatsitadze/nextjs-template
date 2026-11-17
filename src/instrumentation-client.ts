import * as Sentry from '@sentry/nextjs';

import { sentryConfig } from '../sentry.config';

Sentry.init({
  ...sentryConfig,
  integrations: [Sentry.browserTracingIntegration(), Sentry.browserProfilingIntegration()],
  profileSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE) || 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
