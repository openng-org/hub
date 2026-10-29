export * from './caniuse';
import { features, type Feature, type FeatureStatus } from './caniuse';
import apiEvolution from '../data/angular-api-evolution.json';
import migrationExamplesData from '../data/angular-migrations-extended.json';
import replacements from '../data/deprecated-replacements.json';
import { isExcludedApiEvolutionEntry } from './api-evolution-exclusions';
export {
  findMigration,
  getAllMigrations,
  getMigrationMajors,
  getMigrationsForMajor,
  getOptionalMigrations,
  getMandatoryMigrations,
  type Migration,
  type MigrationRepository,
  type MigrationVersion,
} from './migrations';

/** A before/after example of an ng update migration (data/angular-migrations-extended.json). */
export interface MigrationExample {
  name: string;
  explanation?: string;
  commitUrl?: string;
  before?: string;
  after?: string;
}

export const migrationExamples: MigrationExample[] = migrationExamplesData;

type Status = FeatureStatus['status'];

const apiUrl = (name: string, packageName: string) =>
  `https://angular.dev/api/${packageName.replace('@angular', '')}/${name}`;

/** Golden entries that duplicate a curated feature under another name. */
const IGNORED_DUPLICATE_GOLDEN_FEATURES = new Set([
  'NgForOfContext',
  'NgIf',
  'NgIfContext',
  'NgSwitch',
  'NgSwitchCase',
  'NgSwitchDefault',
]);

/**
 * Deprecated public API, derived from the goldens: every entry that was deprecated at some point,
 * with its replacement when it is still deprecated today.
 */
const deprecatedFeatures: Feature[] = apiEvolution
  .filter((api) => !isExcludedApiEvolutionEntry(api))
  .filter((api) => !IGNORED_DUPLICATE_GOLDEN_FEATURES.has(api.name))
  .filter((api) => api.versions.some((v) => v.status === 'deprecated'))
  .map((api) => {
    const stillDeprecated = api.versions[api.versions.length - 1]!.status === 'deprecated';
    const replacement = stillDeprecated ? replacements.find((r) => r.name === api.name) : undefined;
    return {
      name: api.name,
      package: api.package,
      metadata: {
        ...(stillDeprecated ? { referenceUrl: apiUrl(api.name, api.package) } : {}),
        ...(replacement?.replacedBy ? { replacedBy: replacement.replacedBy } : {}),
        ...(replacement?.replacementUrl ? { replacementUrl: replacement.replacementUrl } : {}),
      },
      versions: api.versions.map((v) => ({ version: v.version, status: v.status as Status })),
    };
  });

/** Whether the status changed between the feature's last two recorded versions. */
function hasRecentStatusChange(feature: Feature): boolean {
  if (feature.versions.length < 2) return false;
  const [last, previous] = [...feature.versions].sort((a, b) => b.version - a.version);
  return last!.status !== previous!.status;
}

/**
 * Every feature: the curated ones, then the deprecated public API, deduplicated by name (the
 * curated entry wins), with the features whose status changed recently first. Computed once.
 */
const allFeatures: Feature[] = (() => {
  const seen = new Set<string>();
  const unique = [...features, ...deprecatedFeatures].filter((feature) => {
    if (seen.has(feature.name)) return false;
    seen.add(feature.name);
    return true;
  });
  // A stable sort: features with a recent change first, dataset order otherwise.
  return unique
    .map((feature, index) => ({ feature, index, recent: hasRecentStatusChange(feature) }))
    .sort((a, b) => Number(b.recent) - Number(a.recent) || a.index - b.index)
    .map((entry) => entry.feature);
})();

/** Every feature, recent status changes first. */
export function getFeatures(): Feature[] {
  return allFeatures;
}

/** Packages with at least one feature, in first-seen order. */
export function getPackages(): string[] {
  return [
    ...new Set(allFeatures.map((f) => f.package).filter((pkg): pkg is string => Boolean(pkg))),
  ];
}

export type FeatureStatusChange = {
  feature: Feature;
  currentStatus: { version: number; status: Status } | null;
  previousStatus: { version: number; status: Status } | null;
  changeType: 'new' | 'status-change' | 'removed';
  introducedInVersion: boolean;
};

/**
 * The features whose stage changed in a major (19 covers 19.0, 19.1, 19.2…): introduced in it,
 * changed status in it (preview → stable…), or removed in it. `availableVersions` tells which
 * major came before the target; nothing is reported for the oldest one.
 */
export function getFeaturesWithStageChanges(
  targetVersion: number,
  availableVersions: number[] = [],
): FeatureStatusChange[] {
  const previousVersion =
    availableVersions.filter((v) => v < targetVersion).sort((a, b) => b - a)[0] ?? null;
  if (previousVersion === null) return [];
  const targetVersionMax = targetVersion + 1;
  const changes: FeatureStatusChange[] = [];

  for (const feature of allFeatures) {
    const sortedVersions = [...feature.versions].sort((a, b) => b.version - a.version);
    // The latest entry within the target major, and the latest one before it started.
    const targetEntry = sortedVersions.find((v) => v.version < targetVersionMax);
    const previousEntry = sortedVersions.find((v) => v.version < targetVersion);
    const statusAtTarget = (targetEntry?.status ?? null) as Status;
    const statusAtPrevious = (previousEntry?.status ?? null) as Status;
    const setInTarget =
      targetEntry !== undefined &&
      targetEntry.version >= targetVersion &&
      targetEntry.version < targetVersionMax;

    const introduced = statusAtTarget !== null && setInTarget && statusAtPrevious === null;
    const changed =
      statusAtTarget !== null &&
      statusAtPrevious !== null &&
      statusAtTarget !== statusAtPrevious &&
      setInTarget;
    const removed =
      statusAtPrevious !== null &&
      sortedVersions[0] !== undefined &&
      sortedVersions[0].version < targetVersion;
    if (!introduced && !changed && !removed) continue;

    changes.push({
      feature,
      currentStatus:
        targetEntry && targetEntry.version >= targetVersion
          ? { version: targetEntry.version, status: statusAtTarget }
          : null,
      previousStatus: previousEntry
        ? { version: previousEntry.version, status: statusAtPrevious }
        : null,
      changeType: introduced ? 'new' : removed ? 'removed' : 'status-change',
      introducedInVersion: introduced,
    });
  }

  // New first, then status changes, then removals; by name within each.
  const priority = { new: 0, 'status-change': 1, removed: 2 };
  return changes.sort(
    (a, b) =>
      priority[a.changeType] - priority[b.changeType] ||
      a.feature.name.localeCompare(b.feature.name),
  );
}
