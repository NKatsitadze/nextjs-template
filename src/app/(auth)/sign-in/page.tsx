import { Suspense } from 'react';

import { LoginForm } from '@/features/auth/components/login-form';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  // LoginForm reads `?callbackUrl` via useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
