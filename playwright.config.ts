import { defineConfig, devices } from '@playwright/test';

const browserPort = Number.parseInt(process.env.USV_BROWSER_PORT ?? '5174', 10);
const browserBaseUrl = `http://127.0.0.1:${browserPort}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: browserBaseUrl,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${browserPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    url: browserBaseUrl,
  },
});
