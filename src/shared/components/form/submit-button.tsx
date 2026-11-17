import { type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';

type SubmitButtonProps = {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
  className?: string;
};

export function SubmitButton({ pending, pendingLabel, children, className }: SubmitButtonProps) {
  return (
    <Button type="submit" className={className} disabled={pending}>
      {pending && <Spinner />}
      {pending ? pendingLabel : children}
    </Button>
  );
}
