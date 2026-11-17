'use client';

import { type ReactNode, useState } from 'react';

import { AuthStoreContext } from '@/features/auth/hooks/useAuthStore';
import { createAuthStore } from '@/features/auth/store/auth-store';
import { type User } from '@/features/auth/types/user';
import { NotesStoreContext } from '@/features/notes/hooks/useNotesStore';
import { createNotesStore } from '@/features/notes/store/notes-store';

export type StoreProviderProps = {
  children: ReactNode;
  /** Read on the server (root layout) so the first render already knows who is signed in. */
  initialUser: User | null;
};

export const StoreProvider = ({ children, initialUser }: StoreProviderProps) => {
  const [authStore] = useState(() => createAuthStore({ user: initialUser }));
  const [notesStore] = useState(() => createNotesStore());

  return (
    <AuthStoreContext.Provider value={authStore}>
      <NotesStoreContext.Provider value={notesStore}>{children}</NotesStoreContext.Provider>
    </AuthStoreContext.Provider>
  );
};
