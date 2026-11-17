import { expect, test } from '@playwright/test';

import { makeTestUser, registerViaApi, signInViaUi, type TestUser } from '../helpers';

test.describe('Sign in', () => {
  let user: TestUser;

  test.beforeAll(async ({ request }) => {
    user = makeTestUser();
    await registerViaApi(request, user);
  });

  test('has the expected title and fields', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page).toHaveTitle(/^Sign in · /);
    await expect(page.getByLabel('Email')).toHaveAttribute('autocomplete', 'email');
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  });

  test('shows validation messages for an empty form', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('rejects a wrong password with a generic message', async ({ page }) => {
    await signInViaUi(page, { email: user.email, password: 'wrong-password' });

    await expect(page.getByRole('alert')).toHaveText('Invalid email or password.');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('signs in, returns to the requested page, and signs out', async ({ page }) => {
    await page.goto('/notes');
    await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fnotes/);

    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/notes$/);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects a signed-in user away from the sign-in page', async ({ page }) => {
    await signInViaUi(page, user);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto('/sign-in');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
