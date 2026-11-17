import { ShieldX } from 'lucide-react';

import { StatusPage } from '@/shared/components/layout/status-page';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/shared/constants/routes';

export default function Forbidden() {
  return (
    <StatusPage
      icon={ShieldX}
      title="Access denied"
      description="You don't have permission to access this page."
      actionLabel="Back to dashboard"
      actionHref={DEFAULT_AUTHENTICATED_ROUTE}
    />
  );
}
