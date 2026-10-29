import { LATEST_MAJOR } from '@openng/core-angular-versions';
import {
  healthScore,
  LIBRARY_MAJORS,
  libraries,
  libraryHealth,
  type HealthScore,
  type LibraryCategory,
  type LibraryHealth,
} from '@openng/data-libraries';

import type {
  FilterOption,
  LibraryCard,
  LibraryDetail,
  LibraryList,
  LibraryMajorRow,
  LibraryQuery,
  LibrarySort,
  ScoreBadge,
} from '../../app/features/libraries/libraries.model';
import { monthLabel } from '../community/dates';
import { paginate } from '../query';
import { matches, normalizeTerm } from '../text';

/** Libraries per page (the UI loads the next page as the visitor scrolls). */
export const LIBRARY_PAGE_SIZE = 24;
/** How many recent majors a card shows. */
const CARD_MAJORS = 4;

export const CATEGORY_LABELS: Record<LibraryCategory, string> = {
  state: 'State management',
  data: 'Data & HTTP',
  ui: 'UI components',
  charts: 'Charts',
  forms: 'Forms & editors',
  content: 'Content',
  i18n: 'Internationalization',
  auth: 'Authentication',
  utilities: 'Utilities',
  testing: 'Testing',
  tooling: 'Tooling',
  other: 'Other',
};

/** A tracked library the sync has described, with its category and headline score. */
interface Entry {
  health: LibraryHealth;
  category: LibraryCategory;
  score: HealthScore;
}

/** Newest major first. */
const MAJORS_DESC = [...LIBRARY_MAJORS].sort((a, b) => b - a);

/** Every library with health data, scored for the latest major, in the curated order. Once. */
let entries: Entry[] | null = null;
function allEntries(): Entry[] {
  if (!entries) {
    const byName = new Map(libraryHealth.map((health) => [health.name, health]));
    entries = libraries.flatMap((library) => {
      const health = byName.get(library.name);
      return health
        ? [{ health, category: library.category, score: healthScore(health, LATEST_MAJOR) }]
        : [];
    });
  }
  return entries;
}

/** The route of a library page: scoped names take two segments. */
export function libraryPath(name: string): string[] {
  return ['/libraries', ...name.split('/')];
}

/** Every tracked library's name and route, for the prerender and the search index. */
export function libraryRefs(): { name: string; path: string[]; description: string | null }[] {
  return allEntries().map(({ health }) => ({
    name: health.name,
    path: libraryPath(health.name),
    description: health.description,
  }));
}

export function isLibraryCategory(value: string): value is LibraryCategory {
  return value in CATEGORY_LABELS;
}

/** Why a library gets no score: deprecated on npm, or its repository archived. */
function retiredOf(health: LibraryHealth): ScoreBadge['retired'] {
  return health.deprecated !== null ? 'deprecated' : health.archived ? 'archived' : null;
}

const badge = ({ score, grade, blocked }: HealthScore, health: LibraryHealth): ScoreBadge => ({
  score,
  grade,
  blocked,
  retired: retiredOf(health),
});

/** "1.3M/week", "48K/week", "950/week". */
export function downloadsLabel(weekly: number): string {
  const compact =
    weekly >= 1_000_000
      ? `${(weekly / 1_000_000).toFixed(weekly >= 10_000_000 ? 0 : 1)}M`
      : weekly >= 1_000
        ? `${Math.round(weekly / 1_000)}K`
        : String(weekly);
  return `${compact}/week`;
}

function toCard({ health, category, score }: Entry): LibraryCard {
  return {
    name: health.name,
    path: libraryPath(health.name),
    category,
    categoryLabel: CATEGORY_LABELS[category],
    description: health.description,
    score: badge(score, health),
    downloads: downloadsLabel(health.weeklyDownloads),
    latest: health.latest,
    majors: MAJORS_DESC.slice(0, CARD_MAJORS).map((major) => ({
      major,
      version: health.majors[String(major)]?.version ?? null,
      declared: health.majors[String(major)]?.peer !== null,
    })),
    warning: retiredOf(health),
  };
}

const SORTS: Record<LibrarySort, (a: Entry, b: Entry) => number> = {
  // Libraries without a score (deprecated, archived) come last.
  score: (a, b) =>
    Number(retiredOf(a.health) !== null) - Number(retiredOf(b.health) !== null) ||
    b.score.score - a.score.score ||
    b.health.weeklyDownloads - a.health.weeklyDownloads,
  downloads: (a, b) => b.health.weeklyDownloads - a.health.weeklyDownloads,
  name: (a, b) => a.health.name.localeCompare(b.health.name),
};

export function isLibrarySort(value: string): value is LibrarySort {
  return value in SORTS;
}

/**
 * A page of the tracked libraries matching the filters; the category and major facets count over
 * the search, so a visitor sees what narrowing further would leave.
 */
export function listLibraries(query: LibraryQuery = {}): LibraryList {
  const term = normalizeTerm(query.search);
  const searched = allEntries().filter(({ health, category }) =>
    matches(term, health.name, health.description, CATEGORY_LABELS[category]),
  );
  const supports = (entry: Entry, major: string) => entry.health.majors[major] != null;
  const found = searched
    .filter(
      (entry) =>
        (!query.category || entry.category === query.category) &&
        (!query.major || supports(entry, query.major)),
    )
    .sort(SORTS[query.sort ?? 'score']);
  const page = paginate(found, query.page ?? 1, LIBRARY_PAGE_SIZE);

  const categories: FilterOption[] = [
    { value: '', label: 'All categories', count: searched.length },
    ...(Object.keys(CATEGORY_LABELS) as LibraryCategory[]).flatMap((category) => {
      const count = searched.filter((entry) => entry.category === category).length;
      return count > 0 ? [{ value: category, label: CATEGORY_LABELS[category], count }] : [];
    }),
  ];
  const majors: FilterOption[] = [
    { value: '', label: 'Any Angular', count: searched.length },
    ...MAJORS_DESC.map((major) => ({
      value: String(major),
      label: `Angular ${major}`,
      count: searched.filter((entry) => supports(entry, String(major))).length,
    })),
  ];
  return {
    ...page,
    items: page.items.map(toCard),
    categories,
    majors,
    latestMajor: LATEST_MAJOR,
  };
}

/** One library's page: its facts, its headline score and a score per major. Null when unknown. */
export function libraryDetail(name: string): LibraryDetail | null {
  const entry = allEntries().find((candidate) => candidate.health.name === name);
  return entry ? detailOf(entry.health, entry.category) : null;
}

/**
 * The page view of a library from what is known about it: the tracked ones from health.json, a
 * live check from what npm just answered (with `scoreFor` leaving out the rules it could not read).
 */
export function detailOf(
  health: LibraryHealth,
  category: LibraryCategory,
  scoreFor: (major: number) => HealthScore = (major) => healthScore(health, major),
): LibraryDetail {
  const score = scoreFor(LATEST_MAJOR);
  const rows: LibraryMajorRow[] = MAJORS_DESC.map((major) => {
    const support = health.majors[String(major)] ?? null;
    const previous = health.majors[String(major - 1)] ?? null;
    return {
      major,
      version: support?.version ?? null,
      peer: support?.peer ?? null,
      released: support ? monthLabel(support.released) : null,
      sameAsPrevious: support !== null && previous !== null && previous.version === support.version,
      vulnerabilities: support?.vulnerabilities ?? [],
      score: badge(scoreFor(major), health),
    };
  });
  return {
    name: health.name,
    path: libraryPath(health.name),
    category,
    categoryLabel: CATEGORY_LABELS[category],
    description: health.description,
    npmUrl: `https://www.npmjs.com/package/${health.name}`,
    repository: health.repository,
    license: health.license,
    latest: health.latest,
    latestReleased: monthLabel(health.latestReleased),
    downloads: downloadsLabel(health.weeklyDownloads),
    weeklyDownloads: health.weeklyDownloads,
    deprecated: health.deprecated,
    archived: health.archived,
    latestMajor: LATEST_MAJOR,
    undeclared: Object.values(health.majors).some((support) => support?.peer === null),
    score: { ...badge(score, health), reasons: score.reasons },
    majors: rows,
  };
}
