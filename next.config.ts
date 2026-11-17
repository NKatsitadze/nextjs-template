import { readFileSync } from 'fs';

import { withSentryConfig } from '@sentry/nextjs/config';

import type { NextConfig } from 'next';

const { version: packageVersion } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

const isProduction = process.env.NODE_ENV === 'production';

const resolveVersion = () => {
  const tag = process.env.NEXT_PUBLIC_APP_VERSION;
  if (tag) return tag.replace(/^v/, '');
  return packageVersion;
};

const resolveGitHash = () => {
  if (process.env.NEXT_PUBLIC_APP_VERSION) return '';
  return process.env.NEXT_PUBLIC_GIT_HASH ?? '';
};

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Document-Policy', value: 'js-profiling' },
  ...(isProduction ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    authInterrupts: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: resolveVersion(),
    NEXT_PUBLIC_GIT_HASH: resolveGitHash(),
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: {
    name: process.env.NEXT_PUBLIC_APP_VERSION || process.env.NEXT_PUBLIC_GIT_HASH || undefined,
  },
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
