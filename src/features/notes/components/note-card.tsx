import { NoteCardActions } from '@/features/notes/components/note-card-actions';
import { type Note } from '@/features/notes/types/note';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatDateTime } from '@/shared/utils/date';

type NoteCardProps = {
  note: Note;
};

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Card data-testid="note-card">
      <CardHeader>
        <CardTitle className="truncate">{note.title}</CardTitle>
        <CardDescription>Updated {formatDateTime(note.updatedAt)}</CardDescription>
        <CardAction>
          <NoteCardActions note={note} />
        </CardAction>
      </CardHeader>
      {note.content && (
        <CardContent>
          <p className="line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{note.content}</p>
        </CardContent>
      )}
    </Card>
  );
}
