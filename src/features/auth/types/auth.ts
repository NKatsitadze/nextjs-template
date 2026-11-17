import { type User } from '@/features/auth/types/user';

export type SessionData = {
  sessionId: string;
  user: User;
  createdAt: number;
};

export type AccessTokenPayload = {
  sessionId: string;
};

export type AuthErrorCode = 'LOGIN_INVALID' | 'RATE_LIMITED' | 'EMAIL_TAKEN' | 'VALIDATION_ERROR' | 'UNKNOWN';

export type AuthUserResponse = {
  user: User;
};

export type LoginServiceParams = {
  email: string;
  password: string;
  ip: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: AuthErrorCode | null;
};

export type AuthActions = {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AuthErrorCode | null) => void;
};

export type AuthStore = AuthState & AuthActions;
