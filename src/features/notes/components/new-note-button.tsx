'use client';

import { Plus } from 'lucide-react';

import { useNotesStore } from '@/features/notes/hooks/useNotesStore';
import { Button } from '@/shared/components/ui/button';

export function NewNoteButton() {
  const { openCreate } = useNotesStore();

  return (
    <Button onClick={openCreate}>
      <Plus />
      New note
    </Button>
  );
}
