import { expect, test } from '@playwright/test';

import { AUTH_STATE_PATH } from '../helpers';

test.use({ storageState: AUTH_STATE_PATH });

test.describe('Notes', () => {
  test('creates, edits and deletes a note', async ({ page }) => {
    const title = `Note ${Date.now()}`;
    await page.goto('/notes');

    await page.getByRole('button', { name: 'New note' }).first().click();
    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Content').fill('Written by Playwright');
    await page.getByRole('button', { name: 'Create note' }).click();

    const card = page.getByTestId('note-card').filter({ hasText: title });
    await expect(card).toBeVisible();
    await expect(page.getByText('Note created')).toBeVisible();

    await card.getByRole('button', { name: `Edit ${title}` }).click();
    await page.getByLabel('Title').fill(`${title} (edited)`);
    await page.getByRole('button', { name: 'Save changes' }).click();
    const editedCard = page.getByTestId('note-card').filter({ hasText: `${title} (edited)` });
    await expect(editedCard).toBeVisible();

    await editedCard.getByRole('button', { name: `Delete ${title} (edited)` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
    await expect(editedCard).toHaveCount(0);
  });

  test('requires a title', async ({ page }) => {
    await page.goto('/notes');
    await page.getByRole('button', { name: 'New note' }).first().click();
    await page.getByRole('button', { name: 'Create note' }).click();

    await expect(page.getByText('Title is required')).toBeVisible();
  });
});
