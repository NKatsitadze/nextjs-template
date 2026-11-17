import { expect, test as setup } from '@playwright/test';

import { AUTH_STATE_PATH, makeTestUser, registerViaApi, signInViaUi } from './helpers';

setup('authenticate a fresh user', async ({ page, request }) => {
  const user = makeTestUser();
  await registerViaApi(request, user);
  await signInViaUi(page, user);

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
