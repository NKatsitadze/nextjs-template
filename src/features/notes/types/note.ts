import { type ObjectId, type WithId } from 'mongodb';

import { type PageParams, type PaginatedResult } from '@/shared/types/common';

/** Shape stored in the `notes` collection. */
export type NoteDocument = {
  userId: ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StoredNote = WithId<NoteDocument>;

/** Client-safe note: string id, ISO dates. */
export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = Pick<Note, 'title' | 'content'>;

export type NotesListResponse = PaginatedResult<Note>;

export type NoteResponse = { note: Note };

export type ListNotesServiceParams = PageParams & { userId: string };

export type CreateNoteServiceParams = { userId: string; input: NoteInput };

export type UpdateNoteServiceParams = { userId: string; noteId: string; input: NoteInput };

export type DeleteNoteServiceParams = { userId: string; noteId: string };

export type NotesState = {
  formOpen: boolean;
  editingNote: Note | null;
  deletingNote: Note | null;
  pending: boolean;
};

export type NotesActions = {
  openCreate: () => void;
  openEdit: (note: Note) => void;
  closeForm: () => void;
  openDelete: (note: Note) => void;
  closeDelete: () => void;
  setPending: (pending: boolean) => void;
};

export type NotesStore = NotesState & NotesActions;
