'use client';

import { InfoIcon, RotateCwIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';

type ErrorStateProps = {
  onRetry: () => void;
};

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <Empty className="min-h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InfoIcon />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>We&apos;re having trouble processing your request. Please try again.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry}>
          <RotateCwIcon />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
