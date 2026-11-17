import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/notes/repository/note', () => ({ noteRepository: { updateForUser: vi.fn() } }));

import { noteRepository } from '@/features/notes/repository/note';

import { updateNoteService } from './update-note.service';

const userId = new ObjectId().toString();
const noteId = new ObjectId().toString();
const input = { title: 'Renamed', content: 'Body' };

describe('updateNoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the note scoped to the user and returns it', async () => {
    const date = new Date();
    vi.mocked(noteRepository.updateForUser).mockResolvedValue({
      _id: new ObjectId(noteId), userId: new ObjectId(userId), ...input, createdAt: date, updatedAt: date,
    });

    const result = await updateNoteService({ userId, noteId, input });

    expect(noteRepository.updateForUser).toHaveBeenCalledWith(new ObjectId(noteId), new ObjectId(userId), {
      ...input,
      updatedAt: expect.any(Date),
    });
    expect(result).toMatchObject({ data: { note: { id: noteId, ...input } }, status: 200 });
  });

  it('returns 404 when the note is missing or belongs to someone else', async () => {
    vi.mocked(noteRepository.updateForUser).mockResolvedValue(null);

    await expect(updateNoteService({ userId, noteId, input })).resolves.toEqual({ data: { error: 'NOT_FOUND' }, status: 404 });
  });

  it('propagates repository failures', async () => {
    vi.mocked(noteRepository.updateForUser).mockRejectedValue(new Error('mongo down'));

    await expect(updateNoteService({ userId, noteId, input })).rejects.toThrow('mongo down');
  });
});
