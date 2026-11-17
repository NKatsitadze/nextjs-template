import { Spinner } from '@/shared/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-96 items-center justify-center" role="status" aria-label="Loading">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}
