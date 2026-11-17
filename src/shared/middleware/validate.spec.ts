import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { validateBody, validateFormData, validateRouteParams, validateSearchParams } from './validate';

const Schema = z.object({ title: z.string().min(1), page: z.coerce.number().optional() });

async function errorBody(result: { error: Response } | { data: unknown }) {
  if (!('error' in result)) throw new Error('expected a validation error');
  return { status: result.error.status, body: (await result.error.json()) as unknown };
}

describe('validateBody', () => {
  it('returns parsed data for a valid JSON body', async () => {
    const request = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ title: 'Hi' }) });

    await expect(validateBody(request, Schema)).resolves.toEqual({ data: { title: 'Hi' } });
  });

  it('returns 400 VALIDATION_ERROR with field details', async () => {
    const request = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ title: '' }) });

    const { status, body } = await errorBody(await validateBody(request, Schema));

    expect(status).toBe(400);
    expect(body).toEqual({ error: 'VALIDATION_ERROR', details: [expect.objectContaining({ field: 'title' })] });
  });

  it('returns 400 INVALID_JSON for a malformed body', async () => {
    const request = new Request('http://localhost', { method: 'POST', body: '{nope' });

    await expect(errorBody(await validateBody(request, Schema))).resolves.toEqual({
      status: 400,
      body: { error: 'INVALID_JSON' },
    });
  });
});

describe('validateSearchParams', () => {
  it('parses and coerces query params', async () => {
    const params = new URLSearchParams({ title: 'x', page: '2' });

    await expect(validateSearchParams(params, Schema)).resolves.toEqual({ data: { title: 'x', page: 2 } });
  });

  it('returns 400 VALIDATION_ERROR for invalid params', async () => {
    const { status, body } = await errorBody(await validateSearchParams(new URLSearchParams(), Schema));

    expect(status).toBe(400);
    expect(body).toMatchObject({ error: 'VALIDATION_ERROR' });
  });
});

describe('validateFormData', () => {
  it('parses multipart form fields', async () => {
    const formData = new FormData();
    formData.set('title', 'from form');
    const request = new Request('http://localhost', { method: 'POST', body: formData });

    await expect(validateFormData(request, Schema)).resolves.toEqual({ data: { title: 'from form' } });
  });

  it('returns 400 INVALID_FORM_DATA when the body is not form data', async () => {
    const request = new Request('http://localhost', { method: 'POST', body: 'plain', headers: { 'content-type': 'text/plain' } });

    await expect(errorBody(await validateFormData(request, Schema))).resolves.toEqual({
      status: 400,
      body: { error: 'INVALID_FORM_DATA' },
    });
  });
});

describe('validateRouteParams', () => {
  const ParamsSchema = z.object({ id: z.string().length(3) });

  it('awaits and validates route params', async () => {
    await expect(validateRouteParams(Promise.resolve({ id: 'abc' }), ParamsSchema)).resolves.toEqual({ data: { id: 'abc' } });
  });

  it('returns 400 VALIDATION_ERROR for invalid params', async () => {
    const { status } = await errorBody(await validateRouteParams(Promise.resolve({ id: 'toolong' }), ParamsSchema));

    expect(status).toBe(400);
  });
});
