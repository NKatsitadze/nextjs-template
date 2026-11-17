import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

import { toNote } from './to-note';

describe('toNote', () => {
  it('stringifies the id, serializes dates and drops the owner id', () => {
    const id = new ObjectId();
    const date = new Date('2026-11-17T10:00:00Z');

    expect(toNote({ _id: id, userId: new ObjectId(), title: 'T', content: 'C', createdAt: date, updatedAt: date })).toEqual({
      id: id.toString(),
      title: 'T',
      content: 'C',
      createdAt: '2026-11-17T10:00:00.000Z',
      updatedAt: '2026-11-17T10:00:00.000Z',
    });
  });
});
