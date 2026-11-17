import { NextResponse } from 'next/server';

import { createNoteService } from '@/features/notes/service/create-note.service';
import { listNotesService } from '@/features/notes/service/list-notes.service';
import { NoteInputSchema } from '@/features/notes/validations/note';
import { catchAsync } from '@/shared/middleware/catch-async';
import { validateBody, validateSearchParams } from '@/shared/middleware/validate';
import { withAuth } from '@/shared/middleware/with-auth';
import { PageParamsSchema } from '@/shared/validations/page-params';

export const GET = catchAsync(withAuth(async (request, { session }) => {
  const validation = await validateSearchParams(new URL(request.url).searchParams, PageParamsSchema);
  if ('error' in validation) return validation.error;

  const { page, pageSize } = validation.data;
  const { data, status } = await listNotesService({ userId: session.user.id, page, pageSize });
  return NextResponse.json(data, { status });
}));

export const POST = catchAsync(withAuth(async (request, { session }) => {
  const validation = await validateBody(request, NoteInputSchema);
  if ('error' in validation) return validation.error;

  const { data, status } = await createNoteService({ userId: session.user.id, input: validation.data });
  return NextResponse.json(data, { status });
}));
