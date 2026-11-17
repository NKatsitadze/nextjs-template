import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Route } from 'next';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';

type NotesPaginationProps = {
  page: number;
  totalPages: number;
};

const pageHref = (page: number) => `/notes?page=${page}` as Route;

export function NotesPagination({ page, totalPages }: NotesPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" asChild={hasPrevious} disabled={!hasPrevious}>
        {hasPrevious ? <Link href={pageHref(page - 1)}><ChevronLeft />Previous</Link> : <><ChevronLeft />Previous</>}
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="sm" asChild={hasNext} disabled={!hasNext}>
        {hasNext ? <Link href={pageHref(page + 1)}>Next<ChevronRight /></Link> : <>Next<ChevronRight /></>}
      </Button>
    </nav>
  );
}
