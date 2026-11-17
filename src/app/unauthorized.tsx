import { ShieldAlert } from 'lucide-react';

import { StatusPage } from '@/shared/components/layout/status-page';
import { SIGN_IN_ROUTE } from '@/shared/constants/routes';

export default function Unauthorized() {
  return (
    <StatusPage
      icon={ShieldAlert}
      title="Sign in required"
      description="You need to be signed in to access this page."
      actionLabel="Sign in"
      actionHref={SIGN_IN_ROUTE}
    />
  );
}
