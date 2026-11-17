'use client';

import { useDeleteNote } from '@/features/notes/hooks/use-delete-note';
import { useNotesStore } from '@/features/notes/hooks/useNotesStore';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';

export function DeleteNoteDialog() {
  const { deletingNote, pending, closeDelete } = useNotesStore();
  const { deleteNote } = useDeleteNote();

  return (
    <ConfirmDialog
      open={deletingNote !== null}
      title="Delete note?"
      description={`"${deletingNote?.title ?? ''}" will be permanently deleted.`}
      confirmLabel="Delete"
      pending={pending}
      onConfirm={deleteNote}
      onCancel={closeDelete}
    />
  );
}
