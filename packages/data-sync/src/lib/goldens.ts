import type { Version } from './versions.ts';

/**
 * The public API "goldens" of angular/angular: one API Extractor report per entry point, under
 * goldens/public-api/ — `core/index.api.md` (`core/index.md` before v20, `core/core.md` in v13).
 * Reports for other files of a package (errors, global utils, compiler options) are not entry
 * points and are left out.
 */
export function entryPointOf(path: string): string | null {
  const match = /^public-api\/(.+)\/([^/]+?)(?:\.api)?\.md$/.exec(path);
  if (!match) return null;
  const [, dir = '', file = ''] = match;
  return file === 'index' || file === dir.split('/').at(-1) ? `@angular/${dir}` : null;
}

/** A top-level declaration of a report: `export class X`, `export declare const enum Y`… */
const DECLARATION =
  /^export (?:declare )?(?:abstract )?(?:const enum|enum|class|interface|type|function|const|let|var|namespace) ([A-Za-z_$][\w$]*)/;

/**
 * The exported names of a report and whether they are deprecated. API Extractor writes the release
 * tags in a comment above each declaration (`// @public @deprecated`). A name declared several times
 * (overloads, an interface and a const) is deprecated only when every declaration is. Names API
 * Extractor renamed to avoid a clash (`ResponseInit_2`) are left out.
 */
export function parseGolden(report: string): Map<string, boolean> {
  const apis = new Map<string, boolean>();
  let tags = '';
  for (const line of report.split(/\r?\n/)) {
    if (line.startsWith('//')) {
      if (line.startsWith('// @')) tags = line;
      continue;
    }
    const declaration = DECLARATION.exec(line);
    if (declaration?.[1] && !/_\d+$/.test(declaration[1])) {
      const deprecated = /@deprecated\b/.test(tags);
      apis.set(declaration[1], (apis.get(declaration[1]) ?? true) && deprecated);
    }
    tags = '';
  }
  return apis;
}

export type ApiStatus = 'stable' | 'deprecated' | 'removed' | null;

/** The public API at one release: "<entry point> <name>" → deprecated. */
export interface ApiSnapshot {
  version: Version;
  apis: Map<string, boolean>;
}

/** An API deprecated at some point, with its status in each major (data/api-deprecations.json). */
export interface ApiTimeline {
  name: string;
  package: string;
  /**
   * One entry per major, oldest first: the status at the end of the major. When it changed during
   * the major, `version` is the minor where it did (20.2), otherwise the major (20).
   */
  versions: { version: number; status: ApiStatus }[];
}

export const apiKey = (entryPoint: string, name: string) => `${entryPoint} ${name}`;

/**
 * The timelines of every API deprecated in at least one snapshot. Before it appears an API has no
 * status (null); once gone, it is "removed".
 */
export function deprecationTimelines(snapshots: ApiSnapshot[]): ApiTimeline[] {
  const ordered = [...snapshots].sort(
    (a, b) => a.version.major - b.version.major || a.version.minor - b.version.minor,
  );
  const deprecatedKeys = new Set<string>();
  for (const { apis } of ordered) {
    for (const [key, deprecated] of apis) if (deprecated) deprecatedKeys.add(key);
  }

  const timelines: ApiTimeline[] = [];
  for (const key of deprecatedKeys) {
    const statuses: ApiStatus[] = [];
    let seen = false;
    for (const { apis } of ordered) {
      const deprecated = apis.get(key);
      if (deprecated !== undefined) seen = true;
      statuses.push(
        deprecated === undefined ? (seen ? 'removed' : null) : deprecated ? 'deprecated' : 'stable',
      );
    }
    const [entryPoint = '', name = ''] = key.split(' ');
    timelines.push({ name, package: entryPoint, versions: perMajor(ordered, statuses) });
  }
  return timelines.sort(
    (a, b) => a.package.localeCompare(b.package) || a.name.localeCompare(b.name),
  );
}

function perMajor(snapshots: ApiSnapshot[], statuses: ApiStatus[]): ApiTimeline['versions'] {
  const versions: ApiTimeline['versions'] = [];
  let previous: ApiStatus = null;
  let start = 0;
  while (start < snapshots.length) {
    const major = snapshots[start]!.version.major;
    let end = start;
    while (end + 1 < snapshots.length && snapshots[end + 1]!.version.major === major) end++;

    const status = statuses[end] ?? null;
    // Where the final status of the major began: its first minor, or a later one.
    let since = end;
    while (since > start && statuses[since - 1] === status) since--;
    const minor = snapshots[since]!.version.minor;
    const changedMidMajor = status !== previous && minor > 0;
    versions.push({ version: changedMidMajor ? Number(`${major}.${minor}`) : major, status });

    previous = status;
    start = end + 1;
  }
  return versions;
}
