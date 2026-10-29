import { defineConfig } from 'vitest/config';

import shared from '../../vitest.shared.mts';

/** Coverage is for the parsers and transforms (src/lib); the sync steps are network wiring. */
export default defineConfig({
  test: { coverage: { ...shared.test?.coverage, include: ['src/lib/**/*.ts'] } },
});
