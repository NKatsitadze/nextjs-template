import { type LucideIcon } from 'lucide-react';
import { type Route } from 'next';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';

type StatusPageProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: Route;
};

/** Full-page state for 404 / 401 / 403. A server component: navigation is a plain Link. */
export function StatusPage({ icon: Icon, title, description, actionLabel, actionHref }: StatusPageProps) {
  return (
    <Empty className="min-h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
