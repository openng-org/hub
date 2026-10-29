import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', commits: 'src/commits.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  // The JSON datasets are bundled into the entry.
  loader: { '.json': 'json' },
});
