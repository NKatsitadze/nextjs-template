import { expect, type APIRequestContext, type Page } from '@playwright/test';

/** Signed-in browser state written by auth.setup.ts and reused by specs that need a session. */
export const AUTH_STATE_PATH = 'playwright/.auth/user.json';

export type TestUser = { name: string; email: string; password: string };

/** A fresh account per call, so specs never depend on shared data or on each other. */
export function makeTestUser(): TestUser {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: 'E2E User', email: `e2e-${id}@example.com`, password: `Passw0rd-${id}` };
}

export async function registerViaApi(request: APIRequestContext, user: TestUser): Promise<void> {
  const response = await request.post('/api/auth/register', { data: user });
  expect(response.status(), await response.text()).toBe(201);
}

export async function signInViaUi(page: Page, user: Pick<TestUser, 'email' | 'password'>): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}
