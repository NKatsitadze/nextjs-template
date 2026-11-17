import { NotebookPen } from 'lucide-react';

import { NewNoteButton } from '@/features/notes/components/new-note-button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';

export function NotesEmpty() {
  return (
    <Empty className="border border-dashed border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NotebookPen />
        </EmptyMedia>
        <EmptyTitle>No notes yet</EmptyTitle>
        <EmptyDescription>Capture your first idea — it only takes a second.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <NewNoteButton />
      </EmptyContent>
    </Empty>
  );
}
