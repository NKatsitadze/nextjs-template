import { type Route } from 'next';

import { DEFAULT_AUTHENTICATED_ROUTE } from '@/shared/constants/routes';

/** Only same-site relative paths are allowed as post-login targets (prevents open redirects). */
export function getSafeRedirect(target: string | null | undefined): Route {
  if (!target?.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }
  return target as Route;
}
