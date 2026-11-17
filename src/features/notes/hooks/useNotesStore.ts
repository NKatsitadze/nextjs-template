'use client';

import { createContext, useContext } from 'react';
import { useStore, type StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { type NotesStore } from '@/features/notes/types/note';

export const NotesStoreContext = createContext<StoreApi<NotesStore> | null>(null);

export const useNotesStore = () => {
  const store = useContext(NotesStoreContext);

  if (!store) {
    throw new Error('useNotesStore must be used within StoreProvider');
  }

  return useStore(
    store,
    useShallow((state: NotesStore) => ({
      formOpen: state.formOpen,
      editingNote: state.editingNote,
      deletingNote: state.deletingNote,
      pending: state.pending,
      openCreate: state.openCreate,
      openEdit: state.openEdit,
      closeForm: state.closeForm,
      openDelete: state.openDelete,
      closeDelete: state.closeDelete,
      setPending: state.setPending,
    })),
  );
};
