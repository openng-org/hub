import { getFeatures, getPackages, LinkType, type Feature } from '@openng/data-caniuse';

import type {
  FeatureDetail,
  FeatureLink,
  FeatureList,
  FeatureQuery,
  FeatureRow,
} from '../../app/caniuse/data/api';
import { FEATURE_MAJORS } from './majors';
import { isStatusKey, latestStatus, matrixCells, versionLabel } from './matrix';
import { articleJsonLd } from '../seo';
import { paginate } from '../query';
import { matches, normalizeTerm, slugify } from '../text';

/** Rows per page of the features matrix (the UI loads the next page as the user scrolls). */
export const FEATURE_PAGE_SIZE = 20;

const LINK_TYPES: Record<LinkType, { label: string; icon: string }> = {
  [LinkType.DOCUMENTATION]: { label: 'Documentation', icon: 'pi pi-book' },
  [LinkType.RFC]: { label: 'RFC', icon: 'pi pi-file' },
  [LinkType.RFC_SUMMARY]: { label: 'RFC Summary', icon: 'pi pi-file' },
  [LinkType.PULL_REQUEST]: { label: 'Pull Request', icon: 'pi pi-code' },
  [LinkType.COMMIT]: { label: 'Commit', icon: 'pi pi-github' },
};

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

export function featureIds(): string[] {
  return allEntries().map((entry) => entry.row.id);
}

export function featureDetail(id: string): FeatureDetail | null {
  const all = allEntries();
  const entry = all.find((candidate) => candidate.row.id === id);
  if (!entry) return null;
  const { feature, row } = entry;
  const metadata = feature.metadata ?? {};

  const replacedBy = metadata.replacedBy;
  const replacement = replacedBy
    ? all.find((other) => other.feature.name === replacedBy || other.row.id === replacedBy)
    : undefined;

  return {
    ...row,
    majors: FEATURE_MAJORS,
    notes: metadata.notes ?? null,
    migrationNotes: metadata.migrationNotes ?? null,
    migrationScript: metadata.migrationScript
      ? {
          command: metadata.migrationScript,
          // "ng generate @angular/core:standalone" -> "standalone", what the NG Update tab matches.
          search: metadata.migrationScript.split(':').pop() ?? metadata.migrationScript,
        }
      : null,
    links: featureLinks(feature),
    replacement: replacedBy
      ? { id: replacement?.row.id ?? null, name: replacement?.row.name ?? replacedBy }
      : null,
    jsonLd: articleJsonLd({
      headline: `${row.name} in Angular: status per version`,
      description:
        row.description ??
        `${row.name}${row.latest ? ` is ${row.latest.status} since Angular ${row.latest.version}` : ''}: its status in every Angular version, links and migration notes.`,
      path: `/caniuse/${row.id}`,
      about: row.name,
      image: `/og/caniuse/${row.id}.png`,
    }),
    history: [...feature.versions]
      .filter((entry) => isStatusKey(entry.status))
      .sort((a, b) => b.version - a.version)
      .map((entry) => ({
        version: versionLabel(entry.version),
        status: entry.status!,
        notes: entry.metadata?.notes ?? null,
      })),
  };
}

function featureLinks(feature: Feature): FeatureLink[] {
  const metadata = feature.metadata ?? {};
  const links: FeatureLink[] = [];
  const push = (url: string | undefined, label: string, icon: string) => {
    if (url) links.push({ url, label, icon });
  };
  push(metadata.documentationUrl, 'Documentation', 'pi pi-book');
  push(metadata.rfcUrl, 'RFC Discussion', 'pi pi-file');
  push(metadata.commitUrl, 'Commit', 'pi pi-github');
  push(metadata.referenceUrl, 'Reference', 'pi pi-external-link');
  push(metadata.replacementUrl, 'Replacement', 'pi pi-external-link');
  push(metadata.detailsUrl, 'Details', 'pi pi-file');
  for (const link of metadata.links ?? []) {
    const type = LINK_TYPES[link.type] ?? { label: 'Link', icon: 'pi pi-external-link' };
    push(link.url, type.label, type.icon);
  }
  return links;
}
