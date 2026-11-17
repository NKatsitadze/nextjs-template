import { z } from 'zod';

/** Trims and lower-cases before validating, so `" Ana@Example.com "` and `"ana@example.com"` are one account. */
export const EmailSchema = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));
