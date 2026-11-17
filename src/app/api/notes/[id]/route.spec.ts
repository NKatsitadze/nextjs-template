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
  validateRouteParams: vi.fn(async (params: Promise<unknown>) => ({ data: await params })),
}));
vi.mock('@/features/notes/service/update-note.service', () => ({ updateNoteService: vi.fn() }));
vi.mock('@/features/notes/service/delete-note.service', () => ({ deleteNoteService: vi.fn() }));

import { deleteNoteService } from '@/features/notes/service/delete-note.service';
import { updateNoteService } from '@/features/notes/service/update-note.service';
import { validateBody, validateRouteParams } from '@/shared/middleware/validate';

import { DELETE, PATCH } from './route';

const context = () => ({ params: Promise.resolve({ id: 'n1' }) });
const validationError = () => ({ error: NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 }) });
const input = { title: 'T', content: 'C' };
const patchRequest = () => new Request('http://localhost/api/notes/n1', { method: 'PATCH', body: JSON.stringify(input) });
const deleteRequest = () => new Request('http://localhost/api/notes/n1', { method: 'DELETE' });

describe('/api/notes/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  describe('PATCH', () => {
    it('updates the note for the signed-in user', async () => {
      vi.mocked(updateNoteService).mockResolvedValue({ data: { note: { id: 'n1' } } as never, status: 200 });

      const response = await PATCH(patchRequest(), context());

      expect(updateNoteService).toHaveBeenCalledWith({ userId: 'u1', noteId: 'n1', input });
      expect(response.status).toBe(200);
    });

    it('passes a 404 through', async () => {
      vi.mocked(updateNoteService).mockResolvedValue({ data: { error: 'NOT_FOUND' }, status: 404 });

      expect((await PATCH(patchRequest(), context())).status).toBe(404);
    });

    it.each([
      ['params', () => vi.mocked(validateRouteParams).mockResolvedValueOnce(validationError())],
      ['body', () => vi.mocked(validateBody).mockResolvedValueOnce(validationError())],
    ])('returns 400 for invalid %s without calling the service', async (_case, arrange) => {
      arrange();

      expect((await PATCH(patchRequest(), context())).status).toBe(400);
      expect(updateNoteService).not.toHaveBeenCalled();
    });

    it('returns 500 when the service throws', async () => {
      vi.mocked(updateNoteService).mockRejectedValue(new Error('mongo down'));

      expect((await PATCH(patchRequest(), context())).status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('deletes the note for the signed-in user', async () => {
      vi.mocked(deleteNoteService).mockResolvedValue({ data: { success: true }, status: 200 });

      const response = await DELETE(deleteRequest(), context());

      expect(deleteNoteService).toHaveBeenCalledWith({ userId: 'u1', noteId: 'n1' });
      expect(response.status).toBe(200);
    });

    it('passes a 404 through', async () => {
      vi.mocked(deleteNoteService).mockResolvedValue({ data: { error: 'NOT_FOUND' }, status: 404 });

      expect((await DELETE(deleteRequest(), context())).status).toBe(404);
    });

    it('returns 400 for invalid params without calling the service', async () => {
      vi.mocked(validateRouteParams).mockResolvedValueOnce(validationError());

      expect((await DELETE(deleteRequest(), context())).status).toBe(400);
      expect(deleteNoteService).not.toHaveBeenCalled();
    });

    it('returns 500 when the service throws', async () => {
      vi.mocked(deleteNoteService).mockRejectedValue(new Error('mongo down'));

      expect((await DELETE(deleteRequest(), context())).status).toBe(500);
    });
  });
});
