'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { AuthErrorMessage } from '@/features/auth/components/auth-error-message';
import { useLogin } from '@/features/auth/hooks/use-login';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignInSchema, type SignInType } from '@/features/auth/validations/sign-in';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { SubmitButton } from '@/shared/components/form/submit-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FieldGroup } from '@/shared/components/ui/field';
import { SIGN_UP_ROUTE } from '@/shared/constants/routes';

export const LoginForm = () => {
  const { login } = useLogin();
  const { loading } = useAuthStore();

  const form = useForm<SignInType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(login)} noValidate>
          <FieldGroup>
            <FormTextField control={form.control} name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
            <FormTextField control={form.control} name="password" label="Password" type="password" autoComplete="current-password" />
            <AuthErrorMessage />
            <SubmitButton pending={loading} pendingLabel="Signing in…" className="w-full">
              Sign in
            </SubmitButton>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href={SIGN_UP_ROUTE} className="underline underline-offset-4 hover:text-primary">
                Sign up
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
