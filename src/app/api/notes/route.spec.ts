import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const session = vi.hoisted(() => ({
  sessionId: 'sid',
  user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'user' },
  createdAt: 1,
}));

vi.mock('@/shared/middleware/with-auth', () => ({
  withAuth: vi.fn((handler: (...args: unknown[]) => unknown) => (request: Request, context: unknown) =>
    handler(request, { session }, context)),
}));
vi.mock('@/shared/middleware/validate', () => ({
  validateBody: vi.fn(async (request: Request) => ({ data: (await request.json()) as unknown })),
  validateSearchParams: vi.fn(async () => ({ data: { page: 2, pageSize: 12 } })),
}));
vi.mock('@/features/notes/service/list-notes.service', () => ({ listNotesService: vi.fn() }));
vi.mock('@/features/notes/service/create-note.service', () => ({ createNoteService: vi.fn() }));

import { createNoteService } from '@/features/notes/service/create-note.service';
import { listNotesService } from '@/features/notes/service/list-notes.service';
import { validateBody, validateSearchParams } from '@/shared/middleware/validate';

import { GET, POST } from './route';

const validationError = () => ({ error: NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 }) });

describe('/api/notes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  describe('GET', () => {
    const request = new Request('http://localhost/api/notes?page=2');

    it('lists the signed-in user\'s notes', async () => {
      const page = { items: [], total: 0, page: 2, pageSize: 12 };
      vi.mocked(listNotesService).mockResolvedValue({ data: page, status: 200 });

      const response = await GET(request, undefined);

      expect(listNotesService).toHaveBeenCalledWith({ userId: 'u1', page: 2, pageSize: 12 });
      await expect(response.json()).resolves.toEqual(page);
    });

    it('returns the validation error without calling the service', async () => {
      vi.mocked(validateSearchParams).mockResolvedValueOnce(validationError());

      expect((await GET(request, undefined)).status).toBe(400);
      expect(listNotesService).not.toHaveBeenCalled();
    });

    it('returns 500 when the service throws', async () => {
      vi.mocked(listNotesService).mockRejectedValue(new Error('mongo down'));

      expect((await GET(request, undefined)).status).toBe(500);
    });
  });

  describe('POST', () => {
    const input = { title: 'T', content: 'C' };
    const makeRequest = () => new Request('http://localhost/api/notes', { method: 'POST', body: JSON.stringify(input) });

    it('creates a note for the signed-in user', async () => {
      vi.mocked(createNoteService).mockResolvedValue({ data: { note: { id: 'n1' } } as never, status: 201 });

      const response = await POST(makeRequest(), undefined);

      expect(createNoteService).toHaveBeenCalledWith({ userId: 'u1', input });
      expect(response.status).toBe(201);
    });

    it('returns the validation error without calling the service', async () => {
      vi.mocked(validateBody).mockResolvedValueOnce(validationError());

      expect((await POST(makeRequest(), undefined)).status).toBe(400);
      expect(createNoteService).not.toHaveBeenCalled();
    });

    it('returns 500 when the service throws', async () => {
      vi.mocked(createNoteService).mockRejectedValue(new Error('mongo down'));

      expect((await POST(makeRequest(), undefined)).status).toBe(500);
    });
  });
});
