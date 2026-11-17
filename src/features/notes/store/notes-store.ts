import { createStore } from 'zustand/vanilla';

import { type NotesState, type NotesStore } from '@/features/notes/types/note';

const DEFAULT_NOTES_STATE: NotesState = {
  formOpen: false,
  editingNote: null,
  deletingNote: null,
  pending: false,
};

/** UI state only — the notes themselves are server-rendered and refreshed with `router.refresh()`. */
export const createNotesStore = (initState: Partial<NotesState> = {}) =>
  createStore<NotesStore>()((set) => ({
    ...DEFAULT_NOTES_STATE,
    ...initState,
    openCreate: () => set({ formOpen: true, editingNote: null }),
    openEdit: (note) => set({ formOpen: true, editingNote: note }),
    closeForm: () => set({ formOpen: false, editingNote: null }),
    openDelete: (note) => set({ deletingNote: note }),
    closeDelete: () => set({ deletingNote: null }),
    setPending: (pending) => set({ pending }),
  }));
