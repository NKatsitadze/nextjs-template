'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSaveNote } from '@/features/notes/hooks/use-save-note';
import { useNotesStore } from '@/features/notes/hooks/useNotesStore';
import { NoteInputSchema, type NoteInputType } from '@/features/notes/validations/note';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { SubmitButton } from '@/shared/components/form/submit-button';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';
import { FieldGroup } from '@/shared/components/ui/field';

export function NoteForm() {
  const { editingNote, pending } = useNotesStore();
  const { saveNote } = useSaveNote();

  const form = useForm<NoteInputType>({
    resolver: zodResolver(NoteInputSchema),
    defaultValues: { title: editingNote?.title ?? '', content: editingNote?.content ?? '' },
  });

  return (
    <form onSubmit={form.handleSubmit(saveNote)} noValidate>
      <FieldGroup>
        <FormTextField control={form.control} name="title" label="Title" placeholder="What is this about?" />
        <FormTextField control={form.control} name="content" label="Content" placeholder="Write something…" multiline />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <SubmitButton pending={pending} pendingLabel="Saving…">
            {editingNote ? 'Save changes' : 'Create note'}
          </SubmitButton>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
}
