import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { getSession } from '@/features/auth/service/get-session.service';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/shared/constants/routes';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getSession()) redirect(DEFAULT_AUTHENTICATED_ROUTE);

  return <AuthPageShell>{children}</AuthPageShell>;
}
