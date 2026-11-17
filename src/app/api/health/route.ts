import { NextResponse } from 'next/server';

/** Liveness: the process is up. Does not touch dependencies (see /api/ready). */
export function GET() {
  return NextResponse.json({ status: 'ok' });
}
