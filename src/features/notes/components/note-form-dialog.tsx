'use client';

import { NoteForm } from '@/features/notes/components/note-form';
import { useNotesStore } from '@/features/notes/hooks/useNotesStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';

export function NoteFormDialog() {
  const { formOpen, editingNote, pending, closeForm } = useNotesStore();

  const handleOpenChange = (open: boolean) => {
    if (!open && !pending) closeForm();
  };

  return (
    <Dialog open={formOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingNote ? 'Edit note' : 'New note'}</DialogTitle>
          <DialogDescription>{editingNote ? 'Update the title or content.' : 'Give your note a title and some content.'}</DialogDescription>
        </DialogHeader>
        {/* Remount per note so the form's default values always match what is being edited. */}
        <NoteForm key={editingNote?.id ?? 'new'} />
      </DialogContent>
    </Dialog>
  );
}
