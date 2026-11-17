import 'server-only';

import { type ObjectId } from 'mongodb';

import { type NoteDocument, type StoredNote } from '@/features/notes/types/note';
import { mongo } from '@/shared/lib/mongo';

const notes = () => mongo.getCollection<NoteDocument>('notes');

type NotePage = { items: StoredNote[]; total: number };

type NoteChanges = Pick<NoteDocument, 'title' | 'content' | 'updatedAt'>;

/** Every query is scoped by `userId`, so one user can never read or change another user's notes. */
export const noteRepository = {
  async findPageByUser(userId: ObjectId, skip: number, limit: number): Promise<NotePage> {
    const collection = await notes();
    const [items, total] = await Promise.all([
      collection.find({ userId }).sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments({ userId }),
    ]);
    return { items, total };
  },

  async create(note: NoteDocument): Promise<ObjectId> {
    const { insertedId } = await (await notes()).insertOne(note);
    return insertedId;
  },

  async updateForUser(noteId: ObjectId, userId: ObjectId, changes: NoteChanges): Promise<StoredNote | null> {
    return (await notes()).findOneAndUpdate({ _id: noteId, userId }, { $set: changes }, { returnDocument: 'after' });
  },

  async deleteForUser(noteId: ObjectId, userId: ObjectId): Promise<number> {
    const { deletedCount } = await (await notes()).deleteOne({ _id: noteId, userId });
    return deletedCount;
  },

  async ensureIndexes(): Promise<void> {
    await (await notes()).createIndex({ userId: 1, updatedAt: -1 });
  },
};
