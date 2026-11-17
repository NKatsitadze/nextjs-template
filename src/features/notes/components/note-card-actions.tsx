'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { useNotesStore } from '@/features/notes/hooks/useNotesStore';
import { type Note } from '@/features/notes/types/note';
import { Button } from '@/shared/components/ui/button';

type NoteCardActionsProps = {
  note: Note;
};

export function NoteCardActions({ note }: NoteCardActionsProps) {
  const { openEdit, openDelete } = useNotesStore();

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" aria-label={`Edit ${note.title}`} onClick={() => openEdit(note)}>
        <Pencil />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Delete ${note.title}`} onClick={() => openDelete(note)}>
        <Trash2 />
      </Button>
    </div>
  );
}
