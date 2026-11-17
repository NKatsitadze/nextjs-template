const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Client IP as seen by the first proxy hop, or `-` when unknown. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || request.headers.get('x-real-ip') || '-';
}

/**
 * CSRF guard for cookie-authenticated mutations. Browsers always send `Origin` on
 * cross-site writes, so a present-but-foreign origin is rejected. A missing `Origin`
 * means a non-browser client, which cannot ride the user's cookies.
 */
export function isTrustedOrigin(request: Request): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  const origin = request.headers.get('origin');
  if (!origin) return true;

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
