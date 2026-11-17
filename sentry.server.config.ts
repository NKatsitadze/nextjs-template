import * as Sentry from '@sentry/nextjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { sentryConfig } from './sentry.config';

Sentry.init({
  ...sentryConfig,
  integrations: [nodeProfilingIntegration()],
  profileSessionSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0,
});
