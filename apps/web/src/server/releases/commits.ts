import { commits, commitUrl } from '@openng/data-releases/commits';
import type { ReleaseCommit } from '@openng/data-releases';

import type {
  CommitQuery,
  CommitRow,
  FilterOption,
  ReleaseCommits,
} from '../../app/releases/data/api';
import { memo } from '../memo';
import { paginate } from '../query';
import { matches, normalizeTerm } from '../text';
import { textParts } from './guide';
import { compareVersionsDesc, majorOf } from './versions';

/** Commits per page (the UI loads the next page on demand). */
export const COMMIT_PAGE_SIZE = 50;

/** Labels of the conventional-commit types shown as filters (the facet sorts them by count). */
const TYPE_LABELS: Record<string, string> = {
  feat: 'Features',
  fix: 'Fixes',
  perf: 'Performance',
  refactor: 'Refactors',
  docs: 'Docs',
  build: 'Build',
};

/** A major's commits, newest release first. */
const commitsOf = memo((major: number): ReleaseCommit[] =>
  commits
    .filter((commit) => majorOf(commit.version) === major)
    .sort((a, b) => compareVersionsDesc(a.version, b.version)),
);

export function countCommits(major: number): number {
  return commitsOf(major).length;
}

function toRow(commit: ReleaseCommit): CommitRow {
  return {
    sha: commit.sha,
    shortSha: commit.sha.slice(0, 7),
    url: commitUrl(commit),
    description: textParts(commit.description),
    version: commit.version,
    type: commit.type,
    package: commit.package,
    repository: commit.repository,
  };
}

function facet(
  list: ReleaseCommit[],
  key: 'type' | 'package' | 'version',
  allLabel: string,
  label: (value: string) => string = (value) => value,
  order?: (a: string, b: string) => number,
): FilterOption[] {
  const counts = new Map<string, number>();
  for (const commit of list) {
    const value = commit[key];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const values = [...counts.keys()].sort(
    order ?? ((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b)),
  );
  return [
    { value: '', label: allLabel, count: list.length },
    ...values.map((value) => ({ value, label: label(value), count: counts.get(value) })),
  ];
}

/** The filter options of a major: they only depend on the major, so once per process. */
const facetsOf = memo((major: number) => {
  const all = commitsOf(major);
  return {
    types: facet(all, 'type', 'All types', (type) => TYPE_LABELS[type] ?? type),
    packages: facet(all, 'package', 'All packages'),
    versions: facet(all, 'version', 'All releases', undefined, compareVersionsDesc),
  };
});

/** A page of a major's commits matching the filters; facets count over the whole major. */
export function listCommits(major: number, query: CommitQuery = {}): ReleaseCommits {
  const term = normalizeTerm(query.search);
  const found = commitsOf(major).filter(
    (commit) =>
      (!query.type || commit.type === query.type) &&
      (!query.package || commit.package === query.package) &&
      (!query.version || commit.version === query.version) &&
      matches(term, commit.description, commit.package, commit.type, commit.sha),
  );
  const page = paginate(found, query.page ?? 1, COMMIT_PAGE_SIZE);
  return { major, ...page, items: page.items.map(toRow), ...facetsOf(major) };
}
