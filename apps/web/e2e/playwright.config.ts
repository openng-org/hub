import { defineConfig, devices } from '@playwright/test';

import type { Theme } from './fixtures';

/**
 * End-to-end checks against the BUILT site (`pnpm build` first): accessibility (a11y.spec.ts) and
 * the main journeys (journeys.spec.ts), each in light and dark mode.
 *
 * Starts dist/web/server/server.mjs on E2E_PORT (default 4400) unless E2E_URL points at a running
 * server. `pnpm --filter web e2e`, or `pnpm --filter web a11y` for the accessibility checks alone.
 */
const PORT = Number(process.env['E2E_PORT'] ?? 4400);
const BASE_URL = process.env['E2E_URL'] ?? `http://localhost:${PORT}`;

export default defineConfig<{ hubTheme: Theme }>({
  testDir: '.',
  outputDir: '../test-results',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI']
    ? [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]]
    : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 1000 },
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'light', use: { ...devices['Desktop Chrome'], hubTheme: 'light' } },
    { name: 'dark', use: { ...devices['Desktop Chrome'], hubTheme: 'dark' } },
  ],
  webServer: process.env['E2E_URL']
    ? undefined
    : {
        command: 'node dist/web/server/server.mjs',
        cwd: '..',
        port: PORT,
        env: { PORT: String(PORT) },
        reuseExistingServer: false,
        timeout: 30_000,
      },
});
