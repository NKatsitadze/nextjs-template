import 'server-only';

import { ObjectId } from 'mongodb';

import { noteRepository } from '@/features/notes/repository/note';
import { type DeleteNoteServiceParams } from '@/features/notes/types/note';
import { type ServiceResult } from '@/shared/types/common';

export async function deleteNoteService({ userId, noteId }: DeleteNoteServiceParams): Promise<ServiceResult<{ success: true }>> {
  const deletedCount = await noteRepository.deleteForUser(new ObjectId(noteId), new ObjectId(userId));

  if (deletedCount === 0) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { success: true }, status: 200 };
}
