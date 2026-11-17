import 'server-only';

import { ObjectId } from 'mongodb';

import { noteRepository } from '@/features/notes/repository/note';
import { type NoteResponse, type UpdateNoteServiceParams } from '@/features/notes/types/note';
import { toNote } from '@/features/notes/utils/to-note';
import { type ServiceResult } from '@/shared/types/common';

export async function updateNoteService({ userId, noteId, input }: UpdateNoteServiceParams): Promise<ServiceResult<NoteResponse>> {
  const changes = { title: input.title, content: input.content, updatedAt: new Date() };
  const updated = await noteRepository.updateForUser(new ObjectId(noteId), new ObjectId(userId), changes);

  // Missing and someone-else's notes look the same, so ids of other users' notes are not leaked.
  if (!updated) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { note: toNote(updated) }, status: 200 };
}
