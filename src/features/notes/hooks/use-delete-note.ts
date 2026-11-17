'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useNotesStore } from '@/features/notes/hooks/useNotesStore';
import { http } from '@/shared/lib/http';
import { getErrorMessage } from '@/shared/utils/error-message';

export const useDeleteNote = () => {
  const { deletingNote, closeDelete, setPending } = useNotesStore();
  const router = useRouter();

  const deleteNote = async () => {
    if (!deletingNote) return;
    setPending(true);
    try {
      await http.delete(`/notes/${deletingNote.id}`);
      toast.success('Note deleted');
      closeDelete();
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error, 'Could not delete the note');
      if (message) toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return { deleteNote };
};
