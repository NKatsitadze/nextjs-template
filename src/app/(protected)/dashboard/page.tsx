import { getSession } from '@/features/auth/service/get-session.service';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getSession();

  return <DashboardOverview userName={session?.user.name ?? 'there'} />;
}
