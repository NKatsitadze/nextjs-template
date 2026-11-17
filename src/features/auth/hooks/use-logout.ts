'use client';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SIGN_IN_ROUTE } from '@/shared/constants/routes';
import { http } from '@/shared/lib/http';

export const useLogout = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();

  const logout = async () => {
    await http.post('/auth/logout');
    setUser(null);
    router.replace(SIGN_IN_ROUTE);
    router.refresh();
  };

  return { logout };
};
