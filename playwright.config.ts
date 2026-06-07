import { defineConfig, devices } from '@playwright/test';

// Smoke tests for core flows. Run locally with: npm run build && npm run preview, then `npm run test:e2e`.
// (Browser binaries download on first `npx playwright install`; not run in CI of this scaffold yet.)
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4173', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
