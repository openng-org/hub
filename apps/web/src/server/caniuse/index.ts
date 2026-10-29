/**
 * The Can I Use API: every view the UI renders, built from the workspace data packages.
 *
 * Server-only. Express exposes it under /api/caniuse (handle.ts via server/api.ts); during SSR and
 * prerendering the app calls it in-process. Nothing here reaches the browser bundle.
 */
import type { CaniuseSummary, TabCounts } from '../../app/features/caniuse/caniuse.model';
import { countFeatures, featurePackages } from './features';
import { countMigrations } from './migrations';
import { listEslint, listMcp } from './mcp-eslint';

export { featureRows, listFeatures } from './features';
export {
  migrationDetail,
  migrationMajors,
  migrationRefs,
  migrationsForMajor,
  migrationTree,
} from './migrations';
export { listEslint, listMcp } from './mcp-eslint';

/** Matches per tab for a search (the badges). */
export function tabCounts(search = ''): TabCounts {
  return {
    features: countFeatures(search),
    migrations: countMigrations(search),
    mcp: listMcp(search).total,
    eslint: listEslint({ search }).total,
  };
}

export function summary(): CaniuseSummary {
  return { counts: tabCounts(), packages: featurePackages() };
}
