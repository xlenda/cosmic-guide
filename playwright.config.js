// E2E roda contra o dist/ já exportado (mesmo bundle que vai pro Vercel), não
// contra o Metro dev server — mais rápido e mais fiel ao que está em produção.
// Rodar "npx expo export --platform web" antes se dist/ estiver desatualizado.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tests/e2e/serve-dist.js',
    url: 'http://localhost:4173/cosmic-guide/',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
