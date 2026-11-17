import { z } from 'zod';

import { NOTE_CONTENT_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '@/features/notes/constants/notes';

export const NoteInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(NOTE_TITLE_MAX_LENGTH),
  content: z.string().trim().max(NOTE_CONTENT_MAX_LENGTH),
});

export type NoteInputType = z.infer<typeof NoteInputSchema>;
