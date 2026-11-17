'use client';

import { AUTH_ERROR_MESSAGES } from '@/features/auth/constants/auth';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

export function AuthErrorMessage() {
  const { error } = useAuthStore();
  if (!error) return null;

  return (
    <p role="alert" className="text-sm font-medium text-destructive">
      {AUTH_ERROR_MESSAGES[error]}
    </p>
  );
}
