import { NewNoteButton } from '@/features/notes/components/new-note-button';

type NotesHeaderProps = {
  total: number;
};

export function NotesHeader({ total }: NotesHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Notes</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total === 1 ? '1 note' : `${total} notes`}</p>
      </div>
      <NewNoteButton />
    </div>
  );
}
