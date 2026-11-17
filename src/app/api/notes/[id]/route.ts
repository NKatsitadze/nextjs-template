import { NextResponse } from 'next/server';

import { deleteNoteService } from '@/features/notes/service/delete-note.service';
import { updateNoteService } from '@/features/notes/service/update-note.service';
import { NoteInputSchema } from '@/features/notes/validations/note';
import { catchAsync } from '@/shared/middleware/catch-async';
import { validateBody, validateRouteParams } from '@/shared/middleware/validate';
import { withAuth } from '@/shared/middleware/with-auth';
import { IdParamsSchema } from '@/shared/validations/object-id';

type NoteRouteContext = RouteContext<'/api/notes/[id]'>;

export const PATCH = catchAsync(withAuth<NoteRouteContext>(async (request, { session }, { params }) => {
  const paramsValidation = await validateRouteParams(params, IdParamsSchema);
  if ('error' in paramsValidation) return paramsValidation.error;

  const bodyValidation = await validateBody(request, NoteInputSchema);
  if ('error' in bodyValidation) return bodyValidation.error;

  const { id } = paramsValidation.data;
  const { data, status } = await updateNoteService({ userId: session.user.id, noteId: id, input: bodyValidation.data });
  return NextResponse.json(data, { status });
}));

export const DELETE = catchAsync(withAuth<NoteRouteContext>(async (_request, { session }, { params }) => {
  const validation = await validateRouteParams(params, IdParamsSchema);
  if ('error' in validation) return validation.error;

  const { data, status } = await deleteNoteService({ userId: session.user.id, noteId: validation.data.id });
  return NextResponse.json(data, { status });
}));
