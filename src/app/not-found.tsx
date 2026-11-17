import { FileQuestion } from 'lucide-react';

import { StatusPage } from '@/shared/components/layout/status-page';
import { HOME_ROUTE } from '@/shared/constants/routes';

export default function NotFound() {
  return (
    <StatusPage
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      actionLabel="Go home"
      actionHref={HOME_ROUTE}
    />
  );
}
