import { NextResponse } from 'next/server';
import { z } from 'zod';

type ValidationResult<T> = { data: T } | { error: NextResponse };

type ValidationErrorCode = 'INVALID_JSON' | 'INVALID_PARAMS' | 'INVALID_FORM_DATA';

async function runValidation<T>(
  read: () => unknown,
  schema: z.ZodType<T>,
  fallbackCode: ValidationErrorCode,
): Promise<ValidationResult<T>> {
  try {
    const data = await schema.parseAsync(await read());
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
      return { error: NextResponse.json({ error: 'VALIDATION_ERROR', details }, { status: 400 }) };
    }
    return { error: NextResponse.json({ error: fallbackCode }, { status: 400 }) };
  }
}

export function validateBody<T>(request: Request, schema: z.ZodType<T>): Promise<ValidationResult<T>> {
  return runValidation(() => request.json(), schema, 'INVALID_JSON');
}

export function validateSearchParams<T>(searchParams: URLSearchParams, schema: z.ZodType<T>): Promise<ValidationResult<T>> {
  return runValidation(() => Object.fromEntries(searchParams.entries()), schema, 'INVALID_PARAMS');
}

export function validateFormData<T>(request: Request, schema: z.ZodType<T>): Promise<ValidationResult<T>> {
  return runValidation(async () => Object.fromEntries((await request.formData()).entries()), schema, 'INVALID_FORM_DATA');
}

/** Validates dynamic route segments (`context.params` is a Promise in Next 16). */
export function validateRouteParams<T>(params: Promise<Record<string, string | string[]>>, schema: z.ZodType<T>): Promise<ValidationResult<T>> {
  return runValidation(() => params, schema, 'INVALID_PARAMS');
}
