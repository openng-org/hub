import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    caniuse: 'src/caniuse.ts',
    migrations: 'src/migrations.ts',
    'eslint/index': 'src/eslint/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  // The JSON datasets are bundled into the entries that import them.
  loader: { '.json': 'json' },
});
