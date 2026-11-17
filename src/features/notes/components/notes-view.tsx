import { DeleteNoteDialog } from '@/features/notes/components/delete-note-dialog';
import { NoteFormDialog } from '@/features/notes/components/note-form-dialog';
import { NotesHeader } from '@/features/notes/components/notes-header';
import { NotesList } from '@/features/notes/components/notes-list';
import { NotesPagination } from '@/features/notes/components/notes-pagination';
import { type NotesListResponse } from '@/features/notes/types/note';

type NotesViewProps = {
  data: NotesListResponse;
};

export function NotesView({ data }: NotesViewProps) {
  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div className="flex flex-col gap-6">
      <NotesHeader total={data.total} />
      <NotesList notes={data.items} />
      <NotesPagination page={data.page} totalPages={totalPages} />
      <NoteFormDialog />
      <DeleteNoteDialog />
    </div>
  );
}
