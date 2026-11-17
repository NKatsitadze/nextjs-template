import 'server-only';

import { userRepository } from '@/features/auth/repository/user';
import { noteRepository } from '@/features/notes/repository/note';
import { sendServerErrorToSentry } from '@/shared/lib/sentry';

/**
 * Creates the indexes every feature relies on (idempotent). Runs once on server boot from
 * `instrumentation.ts`. Best effort: a database that is down at boot must not stop the server
 * from starting — requests will surface the outage, and the next boot retries.
 * Register each new repository's `ensureIndexes` here.
 */
export async function ensureDatabaseIndexes(): Promise<void> {
  try {
    await Promise.all([userRepository.ensureIndexes(), noteRepository.ensureIndexes()]);
  } catch (error) {
    console.error('Failed to ensure database indexes', error);
    sendServerErrorToSentry(error, { source: 'database-indexes' });
  }
}
