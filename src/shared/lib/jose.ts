import 'server-only';

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

import { env } from '@/shared/lib/env';

const ALGORITHM = 'HS256';

function getSecret(): Uint8Array {
  return new TextEncoder().encode(env.get().JWT_SECRET);
}

export async function signToken(payload: JWTPayload, expiresInSeconds: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(getSecret());
}

export async function verifyToken<T extends JWTPayload>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify<T>(token, getSecret(), { algorithms: [ALGORITHM] });
    return payload;
  } catch {
    return null;
  }
}
