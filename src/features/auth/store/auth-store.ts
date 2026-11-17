import { createStore } from 'zustand/vanilla';

import { type AuthState, type AuthStore } from '@/features/auth/types/auth';

const DEFAULT_AUTH_STATE: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const createAuthStore = (initState: Partial<AuthState> = {}) =>
  createStore<AuthStore>()((set) => ({
    ...DEFAULT_AUTH_STATE,
    ...initState,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }));
