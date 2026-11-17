'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/shared/components/layout/error-state';
import { reportBoundaryError } from '@/shared/lib/sentry';

import './globals.css';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    reportBoundaryError(error, 'global-error-boundary');
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <ErrorState onRetry={retry} />
      </body>
    </html>
  );
}
