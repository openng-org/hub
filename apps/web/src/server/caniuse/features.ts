import { getFeatures, getPackages, type Feature } from '@openng/data-caniuse';

import type {
  FeatureList,
  FeatureQuery,
  FeatureRow,
} from '../../app/features/caniuse/caniuse.model';
import { FEATURE_MAJORS } from './majors';
import { latestStatus, matrixCells } from './matrix';
import { paginate } from '../query';
import { matches, normalizeTerm, slugify } from '../text';

/** Rows per page of the features matrix (the UI loads the next page as the user scrolls). */
export const FEATURE_PAGE_SIZE = 20;

interface Entry {
  feature: Feature;
  row: FeatureRow;
}

let entries: Entry[] | null = null;

/** Every feature with its matrix row, in dataset order (recent status changes first). */
function allEntries(): Entry[] {
  entries ??= getFeatures().map((feature) => ({ feature, row: toRow(feature) }));
  return entries;
}

/** Stable, URL-safe id: a slug of the curated id, or of the name for derived entries. */
export function featureId(feature: Pick<Feature, 'id' | 'name'>): string {
  return slugify(feature.id ?? feature.name);
}

function toRow(feature: Feature): FeatureRow {
  return {
    id: featureId(feature),
    name: feature.name,
    package: feature.package ?? null,
    description: feature.metadata?.description ?? null,
    latest: latestStatus(feature.versions),
    cells: matrixCells(feature.versions, FEATURE_MAJORS),
  };
}

export function listFeatures(query: FeatureQuery = {}): FeatureList {
  const term = normalizeTerm(query.search);
  const rows = allEntries()
    .map((entry) => entry.row)
    .filter(
      (row) =>
        matches(term, row.name) &&
        (!query.package || row.package === query.package) &&
        (!query.status || row.latest?.status === query.status),
    );
  return { ...paginate(rows, query.page ?? 1, FEATURE_PAGE_SIZE), majors: FEATURE_MAJORS };
}

/** Number of features matching a search (the tab badge). */
export function countFeatures(search = ''): number {
  return listFeatures({ search }).total;
}

/** Package filter options, in first-seen order. */
export const featurePackages = getPackages;

/** Every feature row, in dataset order (the site search indexes them). */
export function featureRows(): FeatureRow[] {
  return allEntries().map((entry) => entry.row);
}
