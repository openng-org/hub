/** A library the hub tracks (data/libraries.json, curated). */
export interface TrackedLibrary {
  /** Its npm name. */
  name: string;
  category: LibraryCategory;
}

export type LibraryCategory =
  | 'state'
  | 'data'
  | 'ui'
  | 'charts'
  | 'forms'
  | 'content'
  | 'i18n'
  | 'auth'
  | 'utilities'
  | 'testing'
  | 'tooling'
  | 'other';

export type VulnerabilitySeverity = 'critical' | 'high' | 'moderate' | 'low';

/** A known vulnerability of a version, from OSV (https://osv.dev). */
export interface Vulnerability {
  /** "GHSA-…" or "CVE-…". */
  id: string;
  severity: VulnerabilitySeverity;
  summary: string;
  url: string;
}

/** The version of a library to use with an Angular major. */
export interface MajorSupport {
  /**
   * The newest stable version whose peer range accepts the major; the latest version when the
   * library declares no Angular peer range at all (then `peer` is null).
   */
  version: string;
  /** The Angular peer range that version declares; null when the library declares none. */
  peer: string | null;
  /** ISO day that version was published. */
  released: string;
  vulnerabilities: Vulnerability[];
}

/** What `pnpm data:sync libraries` knows about a library (data/health.json). */
export interface LibraryHealth {
  name: string;
  description: string | null;
  /** "https://github.com/owner/repo", when the package declares one. */
  repository: string | null;
  license: string | null;
  /** The `latest` dist-tag. */
  latest: string;
  /** ISO day the latest version was published. */
  latestReleased: string;
  weeklyDownloads: number;
  /** The deprecation message on npm, when the latest version carries one. */
  deprecated: string | null;
  /** The repository is archived on GitHub. */
  archived: boolean;
  /** Per Angular major ("14"…): the version to use, or null when no stable version accepts it. */
  majors: Record<string, MajorSupport | null>;
}
