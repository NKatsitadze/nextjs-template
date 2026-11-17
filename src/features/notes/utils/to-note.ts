import { type Note, type StoredNote } from '@/features/notes/types/note';

export function toNote(note: StoredNote): Note {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
