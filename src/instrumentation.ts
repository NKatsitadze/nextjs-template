import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  await import('../sentry.server.config');

  // Not awaited: Next waits for register() before serving, and a slow or down database
  // must not block the server from starting (ensureDatabaseIndexes never rejects).
  const { ensureDatabaseIndexes } = await import('@/shared/service/database-indexes.service');
  void ensureDatabaseIndexes();
}

export const onRequestError = Sentry.captureRequestError;
