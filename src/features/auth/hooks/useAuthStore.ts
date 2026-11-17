'use client';

import { createContext, useContext } from 'react';
import { useStore, type StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { type AuthStore } from '@/features/auth/types/auth';

export const AuthStoreContext = createContext<StoreApi<AuthStore> | null>(null);

export const useAuthStore = () => {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error('useAuthStore must be used within StoreProvider');
  }

  return useStore(
    store,
    useShallow((state: AuthStore) => ({
      user: state.user,
      loading: state.loading,
      error: state.error,
      setUser: state.setUser,
      setLoading: state.setLoading,
      setError: state.setError,
    })),
  );
};
