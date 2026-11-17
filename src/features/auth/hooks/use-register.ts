'use client';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { type AuthUserResponse } from '@/features/auth/types/auth';
import { toAuthErrorCode } from '@/features/auth/utils/to-auth-error-code';
import { type SignUpType } from '@/features/auth/validations/sign-up';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/shared/constants/routes';
import { http } from '@/shared/lib/http';

/** Creates the account, then signs straight in so the user lands on the dashboard. */
export const useRegister = () => {
  const { setUser, setLoading, setError } = useAuthStore();
  const router = useRouter();

  const register = async (input: SignUpType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post<AuthUserResponse>('/auth/register', input);
      const { user } = await http.post<AuthUserResponse>('/auth/login', { email: input.email, password: input.password });
      setUser(user);
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
      router.refresh();
    } catch (error) {
      setError(toAuthErrorCode(error));
    } finally {
      setLoading(false);
    }
  };

  return { register };
};
