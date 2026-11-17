import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/notes/repository/note', () => ({ noteRepository: { findPageByUser: vi.fn() } }));

import { noteRepository } from '@/features/notes/repository/note';

import { listNotesService } from './list-notes.service';

const userId = new ObjectId().toString();
const date = new Date('2026-11-17T10:00:00Z');

describe('listNotesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a page of client-safe notes for the user', async () => {
    const noteId = new ObjectId();
    vi.mocked(noteRepository.findPageByUser).mockResolvedValue({
      items: [{ _id: noteId, userId: new ObjectId(userId), title: 'T', content: 'C', createdAt: date, updatedAt: date }],
      total: 13,
    });

    const result = await listNotesService({ userId, page: 2, pageSize: 12 });

    expect(noteRepository.findPageByUser).toHaveBeenCalledWith(new ObjectId(userId), 12, 12);
    expect(result).toEqual({
      data: {
        items: [{ id: noteId.toString(), title: 'T', content: 'C', createdAt: date.toISOString(), updatedAt: date.toISOString() }],
        total: 13,
        page: 2,
        pageSize: 12,
      },
      status: 200,
    });
  });

  it('returns an empty page', async () => {
    vi.mocked(noteRepository.findPageByUser).mockResolvedValue({ items: [], total: 0 });

    await expect(listNotesService({ userId, page: 1, pageSize: 12 })).resolves.toMatchObject({ data: { items: [], total: 0 } });
  });

  it('propagates repository failures', async () => {
    vi.mocked(noteRepository.findPageByUser).mockRejectedValue(new Error('mongo down'));

    await expect(listNotesService({ userId, page: 1, pageSize: 12 })).rejects.toThrow('mongo down');
  });
});
