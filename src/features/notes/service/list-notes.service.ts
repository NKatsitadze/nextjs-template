import 'server-only';

import { ObjectId } from 'mongodb';

import { noteRepository } from '@/features/notes/repository/note';
import { type ListNotesServiceParams, type NotesListResponse } from '@/features/notes/types/note';
import { toNote } from '@/features/notes/utils/to-note';
import { type ServiceResult } from '@/shared/types/common';

export async function listNotesService({ userId, page, pageSize }: ListNotesServiceParams): Promise<ServiceResult<NotesListResponse>> {
  const { items, total } = await noteRepository.findPageByUser(new ObjectId(userId), (page - 1) * pageSize, pageSize);

  return { data: { items: items.map(toNote), total, page, pageSize }, status: 200 };
}
