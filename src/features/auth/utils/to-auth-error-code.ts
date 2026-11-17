import { AUTH_ERROR_MESSAGES } from '@/features/auth/constants/auth';
import { type AuthErrorCode } from '@/features/auth/types/auth';
import { isHttpError } from '@/shared/lib/http';

function isAuthErrorCode(code: string | undefined): code is AuthErrorCode {
  return code !== undefined && code in AUTH_ERROR_MESSAGES;
}

/** Maps a failed `http` call to a known auth error code so the UI can show a friendly message. */
export function toAuthErrorCode(error: unknown): AuthErrorCode {
  if (isHttpError(error) && isAuthErrorCode(error.code)) return error.code;
  return 'UNKNOWN';
}
