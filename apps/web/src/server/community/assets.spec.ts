import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { organizers, podcasts } from '@openng/data-community';
import { describe, expect, it } from 'vitest';

// `ng test` runs from the project root (where angular.json is); the specs are bundled, so
// import.meta.dirname would not point at the source tree.
const PUBLIC = join(process.cwd(), 'public');

/** A logo path in the data must be a file the site ships, or the card shows a broken image. */
describe('logos', () => {
  it('exist under public/ for every community and podcast that uses a local one', () => {
    const local = [
      ...organizers.map((o) => [o.id, o.logo] as const),
      ...podcasts.map((p) => [p.name, p.logo] as const),
    ].filter((entry): entry is readonly [string, string] => !!entry[1]?.startsWith('/logos/'));
    const missing = local.filter(([, logo]) => !existsSync(join(PUBLIC, logo)));
    expect(missing).toEqual([]);
    expect(local.length).toBeGreaterThan(0);
  });
});
