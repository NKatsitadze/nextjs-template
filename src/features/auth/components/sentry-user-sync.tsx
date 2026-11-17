'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { clearSentryUser, setSentryUser } from '@/shared/lib/sentry';

/** Tags browser errors with the signed-in user's id (id only — no email/PII). Renders nothing. */
export function SentryUserSync() {
  const { user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    if (userId) setSentryUser({ id: userId });
    else clearSentryUser();
  }, [userId]);

  return null;
}
