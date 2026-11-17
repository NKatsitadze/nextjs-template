import { isForceNavigating } from '@/shared/lib/force-navigate';

/**
 * Returns the message to show for a failed request, or `null` when the page is already
 * redirecting (e.g. a 401 sent the user to sign-in) and no error should be shown.
 */
export function getErrorMessage(error: unknown, fallback: string): string | null {
  if (isForceNavigating()) return null;
  return error instanceof Error && error.message ? error.message : fallback;
}
