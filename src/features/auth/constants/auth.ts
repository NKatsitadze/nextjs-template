import { type AuthErrorCode } from '@/features/auth/types/auth';

export const ACCESS_TOKEN_COOKIE = 'accessToken';

/** Idle timeout: the Redis session expires after this long without a request (sliding). */
export const SESSION_IDLE_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Absolute timeout: the JWT and cookie expire this long after sign-in, whatever the activity. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt only uses the first 72 bytes of a password.
export const PASSWORD_MAX_LENGTH = 72;

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  LOGIN_INVALID: 'Invalid email or password.',
  RATE_LIMITED: 'Too many sign-in attempts. Please wait a few minutes and try again.',
  EMAIL_TAKEN: 'An account with this email already exists.',
  VALIDATION_ERROR: 'Please check the highlighted fields.',
  UNKNOWN: 'Something went wrong. Please try again.',
};
