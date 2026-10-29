import { commits, commitUrl } from '@openng/data-releases/commits';
import type { ReleaseCommit } from '@openng/data-releases';

import type {
  AllCommits,
  AllCommitsQuery,
  CommitQuery,
  CommitRow,
  FilterOption,
  ReleaseCommits,
  VersionOption,
} from '../../app/features/releases/releases.model';
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

/** The commits of `list` matching the filters (the search also looks at the release number). */
function filterCommits(list: ReleaseCommit[], query: CommitQuery): ReleaseCommit[] {
  const term = normalizeTerm(query.search);
  return list.filter(
    (commit) =>
      (!query.type || commit.type === query.type) &&
      (!query.package || commit.package === query.package) &&
      (!query.version || commit.version === query.version) &&
      matches(term, commit.description, commit.package, commit.type, commit.sha, commit.version),
  );
}

/** A page of a major's commits matching the filters; facets count over the whole major. */
export function listCommits(major: number, query: CommitQuery = {}): ReleaseCommits {
  const page = paginate(filterCommits(commitsOf(major), query), query.page ?? 1, COMMIT_PAGE_SIZE);
  return { major, ...page, items: page.items.map(toRow), ...facetsOf(major) };
}

/** A value computed on first use, then kept for the process. */
function once<V>(compute: () => V): () => V {
  let value: V | undefined;
  return () => (value ??= compute());
}

/** Every commit of every stable release, newest release first. */
const allCommits = once((): ReleaseCommit[] =>
  [...commits].sort((a, b) => compareVersionsDesc(a.version, b.version)),
);

/** The filter options of the cross-release search, counted over every commit. */
const allFacets = once(() => {
  const all = allCommits();
  // Majors, then releases, in the commits' order: newest first.
  const counts = new Map<string, number>();
  const add = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);
  for (const commit of all) {
    add(String(majorOf(commit.version)));
    add(commit.version);
  }
  const versions: VersionOption[] = [
    { value: '', label: 'All versions', count: all.length, major: false },
  ];
  for (const [key, count] of counts) {
    if (key.includes('.')) continue;
    versions.push({ value: key, label: `Angular ${key}.x`, count, major: true });
    for (const [version, versionCount] of counts) {
      if (version.includes('.') && version.split('.')[0] === key) {
        versions.push({ value: version, label: version, count: versionCount, major: false });
      }
    }
  }
  return {
    versions,
    types: facet(all, 'type', 'All types', (type) => TYPE_LABELS[type] ?? type),
    packages: facet(all, 'package', 'All packages'),
  };
});

/**
 * A page of the commits of every release matching the filters: `version` is one release ("22.1.3")
 * or every release of a major ("22"). Facets count over every commit, so the options do not move
 * as the visitor types.
 */
export function listAllCommits(query: AllCommitsQuery = {}): AllCommits {
  const { version = '', ...filters } = query;
  const scope = !version
    ? allCommits()
    : version.includes('.')
      ? allCommits().filter((c) => c.version === version)
      : allCommits().filter((c) => majorOf(c.version) === Number(version));
  const page = paginate(filterCommits(scope, filters), query.page ?? 1, COMMIT_PAGE_SIZE);
  return { ...page, items: page.items.map(toRow), ...allFacets() };
}
