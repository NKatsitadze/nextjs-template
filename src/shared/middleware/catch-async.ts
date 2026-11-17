import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { toIsoWithLocalOffset } from '@/shared/utils/date';
import { getClientIp } from '@/shared/utils/request';

type RouteHandler<TContext> = (request: Request, context: TContext) => Promise<Response>;

/**
 * Wraps every API route: writes one access-log line per request, and turns any unhandled
 * error into a Sentry event + a generic 500. Handlers never need their own try/catch.
 */
export function catchAsync<TContext = unknown>(handler: RouteHandler<TContext>): RouteHandler<TContext> {
  return async (request, context) => {
    const startedAt = performance.now();
    const { pathname, search } = new URL(request.url);
    const ip = getClientIp(request);
    const logLine = (status: number, bytes: string) => {
      const referer = request.headers.get('referer') ?? '';
      const userAgent = request.headers.get('user-agent') ?? '-';
      const duration = (performance.now() - startedAt).toFixed(1);
      const timestamp = toIsoWithLocalOffset(new Date());
      return `${ip} [${timestamp}] "${request.method} ${pathname}${search}" ${status} ${bytes} "${referer}" "${userAgent}" ${duration}ms`;
    };

    try {
      const response = await handler(request, context);
      console.log(logLine(response.status, response.headers.get('content-length') ?? '0'));
      return response;
    } catch (error) {
      console.error(logLine(500, '0'), error);
      Sentry.captureException(error, {
        tags: {
          source: 'api-route',
          method: request.method,
          path: pathname,
          error_type: error instanceof Error ? error.name : 'UnknownError',
        },
        contexts: { http: { url: request.url, method: request.method } },
        level: 'error',
      });
      return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
    }
  };
}
