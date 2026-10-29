/** Versions as Angular tags them: "22.1.0", "v22.1.0", "22.2.0-next.3", "22.1.0-rc.1". */
export interface Version {
  major: number;
  minor: number;
  patch: number;
  /** "next.3", "rc.1"; null for a stable release. */
  pre: string | null;
}

const VERSION = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

/** The version of a tag, or null when the tag is not a release (a branch name, "zone.js-0.15.0"). */
export function parseVersion(tag: string): Version | null {
  const match = VERSION.exec(tag);
  if (!match) return null;
  const [, major, minor, patch, pre] = match;
  return { major: Number(major), minor: Number(minor), patch: Number(patch), pre: pre ?? null };
}

export function formatVersion({ major, minor, patch, pre }: Version): string {
  return `${major}.${minor}.${patch}${pre ? `-${pre}` : ''}`;
}

/** Semver order, ascending: 22.1.0-next.1 < 22.1.0-rc.0 < 22.1.0 < 22.1.1. */
export function compareVersions(a: Version, b: Version): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch || comparePre(a.pre, b.pre);
}

function comparePre(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const pa = a.split('.');
  const pb = b.split('.');
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i];
    const y = pb[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const diff = /^\d+$/.test(x) && /^\d+$/.test(y) ? Number(x) - Number(y) : x.localeCompare(y);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** The first release of each minor (X.Y.0), oldest first, from a list of tags. */
export function minorReleases(tags: string[], fromMajor = 0): { tag: string; version: Version }[] {
  return tags
    .map((tag) => ({ tag, version: parseVersion(tag) }))
    .filter(
      (entry): entry is { tag: string; version: Version } =>
        entry.version !== null &&
        entry.version.pre === null &&
        entry.version.patch === 0 &&
        entry.version.major >= fromMajor,
    )
    .sort((a, b) => compareVersions(a.version, b.version));
}
