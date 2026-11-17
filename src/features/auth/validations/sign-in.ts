import { z } from 'zod';

import { PASSWORD_MAX_LENGTH } from '@/features/auth/constants/auth';
import { EmailSchema } from '@/shared/validations/email';

export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required').max(PASSWORD_MAX_LENGTH),
});

export type SignInType = z.infer<typeof SignInSchema>;
