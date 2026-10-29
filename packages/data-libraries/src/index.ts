import healthData from '../data/health.json' with { type: 'json' };
import librariesData from '../data/libraries.json' with { type: 'json' };

import type { LibraryHealth, TrackedLibrary } from './models';

export type * from './models';
export * from './health-score';

/** The libraries the hub tracks, as curated in data/libraries.json. */
export const libraries = librariesData as TrackedLibrary[];
/**
 * What the last `pnpm data:sync libraries` found for each of them (data/health.json), in the order
 * of libraries.json. A library added to the list appears here after the next sync.
 */
export const libraryHealth = healthData as LibraryHealth[];
