import { redirect } from 'next/navigation';

import { getSession } from '@/features/auth/service/get-session.service';
import { NotesView } from '@/features/notes/components/notes-view';
import { listNotesService } from '@/features/notes/service/list-notes.service';
import { SIGN_IN_ROUTE } from '@/shared/constants/routes';
import { PageParamsSchema } from '@/shared/validations/page-params';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Notes' };

// Server-first read: the page calls the service directly — no client fetch, no loading flash.
// Mutations go through /api/notes and then `router.refresh()` re-runs this page.
export default async function NotesPage({ searchParams }: PageProps<'/notes'>) {
  const session = await getSession();
  if (!session) redirect(SIGN_IN_ROUTE);

  const { page, pageSize } = PageParamsSchema.parse(await searchParams);
  const { data } = await listNotesService({ userId: session.user.id, page, pageSize });
  if ('error' in data) throw new Error(data.error);

  return <NotesView data={data} />;
}
