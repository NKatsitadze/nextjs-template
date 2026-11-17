'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { AuthErrorMessage } from '@/features/auth/components/auth-error-message';
import { useRegister } from '@/features/auth/hooks/use-register';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignUpSchema, type SignUpType } from '@/features/auth/validations/sign-up';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { SubmitButton } from '@/shared/components/form/submit-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FieldGroup } from '@/shared/components/ui/field';
import { SIGN_IN_ROUTE } from '@/shared/constants/routes';

export const SignUpForm = () => {
  const { register } = useRegister();
  const { loading } = useAuthStore();

  const form = useForm<SignUpType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(register)} noValidate>
          <FieldGroup>
            <FormTextField control={form.control} name="name" label="Full name" autoComplete="name" placeholder="Ana Smith" />
            <FormTextField control={form.control} name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
            <FormTextField control={form.control} name="password" label="Password" type="password" autoComplete="new-password" />
            <AuthErrorMessage />
            <SubmitButton pending={loading} pendingLabel="Creating account…" className="w-full">
              Create account
            </SubmitButton>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href={SIGN_IN_ROUTE} className="underline underline-offset-4 hover:text-primary">
                Sign in
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
