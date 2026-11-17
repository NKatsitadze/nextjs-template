import { NextResponse } from 'next/server';

import { getSession } from '@/features/auth/service/get-session.service';
import { type SessionData } from '@/features/auth/types/auth';
import { setSentryUser } from '@/shared/lib/sentry';

export type AuthContext = {
  session: SessionData;
};

type AuthedHandler<TContext> = (request: Request, auth: AuthContext, context: TContext) => Promise<Response>;
type RouteHandler<TContext> = (request: Request, context: TContext) => Promise<Response>;

/** Rejects the request with 401 unless it carries a valid JWT backed by a live Redis session. */
export function withAuth<TContext = unknown>(handler: AuthedHandler<TContext>): RouteHandler<TContext> {
  return async (request, context) => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    // Errors captured while handling this request are attributed to the user (id only).
    setSentryUser({ id: session.user.id });
    return handler(request, { session }, context);
  };
}
