'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { type AuthUserResponse } from '@/features/auth/types/auth';
import { getSafeRedirect } from '@/features/auth/utils/safe-redirect';
import { toAuthErrorCode } from '@/features/auth/utils/to-auth-error-code';
import { type SignInType } from '@/features/auth/validations/sign-in';
import { http } from '@/shared/lib/http';

export const useLogin = () => {
  const { setUser, setLoading, setError } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = async (credentials: SignInType) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await http.post<AuthUserResponse>('/auth/login', credentials);
      setUser(user);
      router.replace(getSafeRedirect(searchParams.get('callbackUrl')));
      router.refresh();
    } catch (error) {
      setError(toAuthErrorCode(error));
    } finally {
      setLoading(false);
    }
  };

  return { login };
};
