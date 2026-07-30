/** @type {import('@playwright/test').PlaywrightTestConfig} */
const port = process.env.PORT ?? '5000';
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default {
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
  },
  webServer: {
    command: 'node --import tsx ../artifacts/api-server/src/index.ts',
    url: `${baseURL}/api/v1/health`,
    reuseExistingServer: !process.env.CI,
    cwd: '.',
    env: {
      PORT: port,
    },
    timeout: 120_000,
  },
};
