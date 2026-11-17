import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/notes/repository/note', () => ({ noteRepository: { deleteForUser: vi.fn() } }));

import { noteRepository } from '@/features/notes/repository/note';

import { deleteNoteService } from './delete-note.service';

const userId = new ObjectId().toString();
const noteId = new ObjectId().toString();

describe('deleteNoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the note scoped to the user', async () => {
    vi.mocked(noteRepository.deleteForUser).mockResolvedValue(1);

    await expect(deleteNoteService({ userId, noteId })).resolves.toEqual({ data: { success: true }, status: 200 });
    expect(noteRepository.deleteForUser).toHaveBeenCalledWith(new ObjectId(noteId), new ObjectId(userId));
  });

  it('returns 404 when nothing was deleted', async () => {
    vi.mocked(noteRepository.deleteForUser).mockResolvedValue(0);

    await expect(deleteNoteService({ userId, noteId })).resolves.toEqual({ data: { error: 'NOT_FOUND' }, status: 404 });
  });

  it('propagates repository failures', async () => {
    vi.mocked(noteRepository.deleteForUser).mockRejectedValue(new Error('mongo down'));

    await expect(deleteNoteService({ userId, noteId })).rejects.toThrow('mongo down');
  });
});
