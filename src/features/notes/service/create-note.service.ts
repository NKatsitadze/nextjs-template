import 'server-only';

import { ObjectId } from 'mongodb';

import { noteRepository } from '@/features/notes/repository/note';
import { type CreateNoteServiceParams, type NoteResponse } from '@/features/notes/types/note';
import { toNote } from '@/features/notes/utils/to-note';
import { type ServiceResult } from '@/shared/types/common';

export async function createNoteService({ userId, input }: CreateNoteServiceParams): Promise<ServiceResult<NoteResponse>> {
  const now = new Date();
  const document = { userId: new ObjectId(userId), title: input.title, content: input.content, createdAt: now, updatedAt: now };
  const id = await noteRepository.create(document);

  return { data: { note: toNote({ _id: id, ...document }) }, status: 201 };
}
