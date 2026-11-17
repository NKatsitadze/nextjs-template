import { describe, expect, it } from 'vitest';

import { createNotesStore } from './notes-store';

const note = { id: 'n1', title: 'T', content: 'C', createdAt: '', updatedAt: '' };

describe('createNotesStore', () => {
  it('opens the form empty for create and prefilled for edit', () => {
    const store = createNotesStore();

    store.getState().openEdit(note);
    expect(store.getState()).toMatchObject({ formOpen: true, editingNote: note });

    store.getState().openCreate();
    expect(store.getState()).toMatchObject({ formOpen: true, editingNote: null });
  });

  it('clears the edited note when the form closes', () => {
    const store = createNotesStore({ formOpen: true, editingNote: note });

    store.getState().closeForm();

    expect(store.getState()).toMatchObject({ formOpen: false, editingNote: null });
  });

  it('tracks the note pending deletion', () => {
    const store = createNotesStore();

    store.getState().openDelete(note);
    expect(store.getState().deletingNote).toBe(note);

    store.getState().closeDelete();
    expect(store.getState().deletingNote).toBeNull();
  });
});
