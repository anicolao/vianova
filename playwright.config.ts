import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5196',
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'bun run dev',
    url: 'http://127.0.0.1:5196',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  },
  reporter: [['list'], ['html', { open: 'never' }]]
});
