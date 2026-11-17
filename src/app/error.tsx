'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/shared/components/layout/error-state';
import { reportBoundaryError } from '@/shared/lib/sentry';

type RouteErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function RouteError({ error, retry }: RouteErrorProps) {
  useEffect(() => {
    reportBoundaryError(error, 'route-error-boundary');
  }, [error]);

  return <ErrorState onRetry={retry} />;
}
