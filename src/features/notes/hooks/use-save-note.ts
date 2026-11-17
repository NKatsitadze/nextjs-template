'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useNotesStore } from '@/features/notes/hooks/useNotesStore';
import { type NoteResponse } from '@/features/notes/types/note';
import { type NoteInputType } from '@/features/notes/validations/note';
import { http } from '@/shared/lib/http';
import { getErrorMessage } from '@/shared/utils/error-message';

/** Creates a note, or updates `editingNote` when the form was opened for edit. */
export const useSaveNote = () => {
  const { editingNote, closeForm, setPending } = useNotesStore();
  const router = useRouter();

  const saveNote = async (input: NoteInputType) => {
    setPending(true);
    try {
      if (editingNote) {
        await http.patch<NoteResponse>(`/notes/${editingNote.id}`, input);
      } else {
        await http.post<NoteResponse>('/notes', input);
      }
      toast.success(editingNote ? 'Note updated' : 'Note created');
      closeForm();
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error, 'Could not save the note');
      if (message) toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return { saveNote };
};
