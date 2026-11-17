import { NoteCard } from '@/features/notes/components/note-card';
import { NotesEmpty } from '@/features/notes/components/notes-empty';
import { type Note } from '@/features/notes/types/note';

type NotesListProps = {
  notes: Note[];
};

export function NotesList({ notes }: NotesListProps) {
  if (notes.length === 0) return <NotesEmpty />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
