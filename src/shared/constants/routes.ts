export const SIGN_IN_ROUTE = '/sign-in';
export const SIGN_UP_ROUTE = '/sign-up';
export const HOME_ROUTE = '/';
export const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';

/** Pages only for signed-out users; signed-in users are redirected away. */
export const AUTH_ROUTES = [SIGN_IN_ROUTE, SIGN_UP_ROUTE];

/** Page prefixes that require a session. Keep in sync with the `(protected)` route group. */
export const PROTECTED_ROUTES = ['/dashboard', '/notes'];
