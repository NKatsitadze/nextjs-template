import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { getSession } from '@/features/auth/service/get-session.service';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { Header } from '@/shared/components/layout/header';
import { SIGN_IN_ROUTE } from '@/shared/constants/routes';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // Authoritative check (JWT + live Redis session). src/proxy.ts only does a fast JWT pre-check.
  if (!(await getSession())) redirect(SIGN_IN_ROUTE);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
