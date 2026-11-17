import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/notes/repository/note', () => ({ noteRepository: { create: vi.fn() } }));

import { noteRepository } from '@/features/notes/repository/note';

import { createNoteService } from './create-note.service';

const userId = new ObjectId().toString();
const input = { title: 'Groceries', content: 'Milk' };

describe('createNoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores the note for the user and returns it with 201', async () => {
    const noteId = new ObjectId();
    vi.mocked(noteRepository.create).mockResolvedValue(noteId);

    const result = await createNoteService({ userId, input });

    expect(noteRepository.create).toHaveBeenCalledWith({
      userId: new ObjectId(userId),
      ...input,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(result).toEqual({
      data: { note: { id: noteId.toString(), ...input, createdAt: expect.any(String), updatedAt: expect.any(String) } },
      status: 201,
    });
  });

  it('propagates repository failures', async () => {
    vi.mocked(noteRepository.create).mockRejectedValue(new Error('mongo down'));

    await expect(createNoteService({ userId, input })).rejects.toThrow('mongo down');
  });
});
