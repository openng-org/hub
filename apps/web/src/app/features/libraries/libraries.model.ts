/**
 * The library health API as the UI sees it (`/api/libraries/...`), shaped by the server
 * (src/server/libraries): the UI renders, it does not compute.
 */
import type { HealthGrade, HealthReason, HealthRule, Vulnerability } from '@openng/data-libraries';

export type { HealthGrade, HealthReason, HealthRule, Vulnerability };

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/** A score as the UI shows it. */
export interface ScoreBadge {
  /** 0 to 100. */
  score: number;
  grade: HealthGrade;
  /** A critical or high vulnerability: the badge shows a warning instead of the number. */
  blocked: boolean;
  /** Deprecated on npm or archived on GitHub: no score is shown, the badge stays empty. */
  retired: 'deprecated' | 'archived' | null;
}

/** Whether a library has a version for a major, for the dots of a card. */
export interface MajorDot {
  major: number;
  /** The version to use, null when none accepts the major. */
  version: string | null;
  /** False when the library declares no Angular peer range: `version` is its latest, untested. */
  declared: boolean;
}

export interface LibraryCard {
  name: string;
  /** Route segments of its page: ['/libraries', '@ngrx', 'store']. */
  path: string[];
  category: string;
  categoryLabel: string;
  description: string | null;
  /** The score for the latest Angular major. */
  score: ScoreBadge;
  /** "1.3M/week". */
  downloads: string;
  latest: string;
  /** The most recent majors, newest first. */
  majors: MajorDot[];
  /** Why the library is best avoided today, when it is. */
  warning: 'deprecated' | 'archived' | null;
}

export type LibrarySort = 'score' | 'downloads' | 'name';

export interface LibraryQuery {
  search?: string;
  category?: string;
  /** Only the libraries with a version for this major ("22"). */
  major?: string;
  sort?: LibrarySort;
  page?: number;
}

export interface LibraryList {
  items: LibraryCard[];
  /** Libraries matching the filters, across all pages. */
  total: number;
  page: number;
  pageCount: number;
  categories: FilterOption[];
  /** The tracked majors, newest first, with how many libraries support each. */
  majors: FilterOption[];
  latestMajor: number;
}

/** One row of the per-major table of a library page. */
export interface LibraryMajorRow {
  major: number;
  /** Null when no stable version accepts the major. */
  version: string | null;
  /** The peer range that version declares; null when the library declares none. */
  peer: string | null;
  /** "Mar 2026". */
  released: string | null;
  /** The same version serves the major before: no release for this one. */
  sameAsPrevious: boolean;
  vulnerabilities: Vulnerability[];
  score: ScoreBadge;
}

export interface LibraryDetail {
  name: string;
  path: string[];
  category: string;
  categoryLabel: string;
  description: string | null;
  npmUrl: string;
  repository: string | null;
  license: string | null;
  latest: string;
  /** "Mar 2026". */
  latestReleased: string;
  downloads: string;
  weeklyDownloads: number;
  deprecated: string | null;
  archived: boolean;
  latestMajor: number;
  /** The library declares no Angular peer range: the versions are its latest, support unknown. */
  undeclared: boolean;
  /** The score for the latest major, with every rule that took points. */
  score: ScoreBadge & { reasons: HealthReason[] };
  /** Newest major first. */
  majors: LibraryMajorRow[];
}

/** Any npm package, checked live against npm and GitHub (`/api/libraries/check?package=`). */
export interface LibraryCheck {
  detail: LibraryDetail;
  /** The hub tracks it too: its page has the weekly-synced numbers. */
  tracked: boolean;
  /** What could not be read this time, hence left out of the score. */
  caveats: string[];
  /** ISO timestamp of the check. */
  checkedAt: string;
}

export interface LibraryCheckError {
  /** Not an npm name or URL; no such package (or no release); npm or GitHub did not answer. */
  error: 'invalid-name' | 'not-found' | 'unreachable';
}
