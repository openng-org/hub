import { defineConfig } from 'vitest/config';

/**
 * Shared by the workspace packages (each `vitest.config.ts` re-exports it): coverage of the
 * package's own sources, enforced when tests run with `--coverage` (CI does).
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
      reporter: ['text-summary', 'lcov'],
      thresholds: { statements: 85, branches: 75, functions: 85, lines: 85 },
    },
  },
});
