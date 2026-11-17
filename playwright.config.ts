import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'], quiet: true });

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('[E2E Config] BASE_URL is not set. Define it in .env (e.g. BASE_URL=http://localhost:3000).');
}

const isCI = !!process.env.CI;
const browsers = process.env.PW_BROWSERS?.split(',') ?? ['chromium', 'firefox'];
const workers = process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : isCI ? 2 : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  maxFailures: isCI ? 10 : 0,
  workers,
  reporter: [
    [isCI ? 'list' : 'line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
  ],
  expect: { timeout: isCI ? 20_000 : 10_000 },
  timeout: isCI ? 120_000 : 45_000,
  use: {
    baseURL,
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: isCI ? 20_000 : 15_000,
    navigationTimeout: isCI ? 90_000 : 30_000,
  },
  // PW_WEB_SERVER=1 builds nothing — it starts the already-built app (`npm run build` first).
  webServer: process.env.PW_WEB_SERVER
    ? { command: 'npm start', url: `${baseURL}/api/health`, reuseExistingServer: !isCI, timeout: 120_000 }
    : undefined,
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    ...[
      {
        name: 'chromium',
        use: {
          ...devices['Desktop Chrome'],
          launchOptions: { args: isCI ? ['--disable-dev-shm-usage'] : [] },
        },
      },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ]
      .filter((project) => browsers.includes(project.name))
      .map((project) => ({ ...project, dependencies: ['setup'] })),
  ],
});
