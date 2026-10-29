import { ANGULAR_RELEASES, ANGULAR_VERSIONS } from '@openng/core-angular-versions';

import type { LibraryHealth, MajorSupport } from './models';

/** The oldest Angular major the health check covers. */
export const LIBRARY_FIRST_MAJOR = 14;

/** The majors the health check covers, oldest first. */
export const LIBRARY_MAJORS: number[] = ANGULAR_VERSIONS.filter(
  (major) => major >= LIBRARY_FIRST_MAJOR,
);

/** How many of the most recent majors the support rules look at. */
export const SUPPORT_WINDOW = 3;
/** Under this many weekly downloads, a library counts as little used. */
export const POPULARITY_THRESHOLD = 1000;

export type HealthGrade = 'good' | 'fair' | 'poor';

/** One rule that cost points (or zeroed the score). */
export interface HealthReason {
  rule: HealthRule;
  /** Points taken off (100 for a blocking vulnerability). */
  points: number;
  /** Why, in a sentence. */
  detail: string;
}

export type HealthRule =
  'vulnerabilities' | 'support' | 'stale' | 'maturity' | 'popularity' | 'maintenance';

export interface HealthScore {
  /** 0 to 100. */
  score: number;
  grade: HealthGrade;
  /** A critical or high vulnerability: the score is 0 whatever the rest. */
  blocked: boolean;
  reasons: HealthReason[];
}

export function healthGrade(score: number): HealthGrade {
  return score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor';
}

/**
 * The health score of a library for an Angular major: how safe it is to pick it for a project on
 * that major. Starts at 100; each rule below takes points off; the result is clamped to 0–100.
 * HEALTH_SCORE.md spells the rules out for readers.
 *
 * 1. Vulnerabilities of the version recommended for the major: a critical or high one blocks
 *    (score 0); otherwise −5 per moderate, −2 per low.
 * 2. Support: −10 for each of the `SUPPORT_WINDOW` most recent majors (the major and the ones
 *    before it) without a stable version accepting it. A library that declares no Angular peer
 *    range at all (its versions are used as they come) is neither penalized nor credited here.
 * 3. Stale releases: −5 for each recent major (same window) served by the version that already
 *    served the major before it and was published before that major came out, counting down
 *    from the major while it is the case. A release after the major came out, open range or not,
 *    is the author saying it supports it.
 * 4. Maturity: −20 when the recommended version is still 0.x.
 * 5. Popularity: −10 under `POPULARITY_THRESHOLD` weekly downloads.
 * 6. Maintenance: −30 when the package is deprecated on npm or its repository archived.
 *
 * `unavailable` names the rules whose data could not be read (a live check that GitHub or the
 * downloads API did not answer): those rules are skipped rather than applied to a blank.
 */
export function healthScore(
  library: LibraryHealth,
  major: number,
  { unavailable = [] }: { unavailable?: HealthRule[] } = {},
): HealthScore {
  const reasons: HealthReason[] = [];
  const skipped = new Set(unavailable);
  const support = library.majors[String(major)] ?? null;

  const blocking = skipped.has('vulnerabilities') ? null : blockingVulnerability(support);
  if (blocking) {
    return {
      score: 0,
      grade: 'poor',
      blocked: true,
      reasons: [{ rule: 'vulnerabilities', points: 100, detail: blocking }],
    };
  }
  let score = 100;
  const take = (rule: HealthRule, points: number, detail: string) => {
    if (skipped.has(rule)) return;
    score -= points;
    reasons.push({ rule, points, detail });
  };

  if (support) {
    const moderate = support.vulnerabilities.filter((v) => v.severity === 'moderate').length;
    const low = support.vulnerabilities.filter((v) => v.severity === 'low').length;
    if (moderate > 0)
      take(
        'vulnerabilities',
        5 * moderate,
        plural(moderate, 'moderate vulnerability', 'moderate vulnerabilities') +
          ` in ${support.version}`,
      );
    if (low > 0)
      take(
        'vulnerabilities',
        2 * low,
        plural(low, 'low-severity vulnerability', 'low-severity vulnerabilities') +
          ` in ${support.version}`,
      );
  }

  const window = support?.peer === null ? [] : recentMajors(major);
  const unsupported = window.filter((m) => !library.majors[String(m)]);
  if (unsupported.length > 0) {
    take(
      'support',
      10 * unsupported.length,
      unsupported.length === window.length
        ? `No stable version supports Angular ${list(window)}`
        : `No stable version supports Angular ${list(unsupported)}`,
    );
  }

  const stale: number[] = [];
  for (const m of window) {
    const current = library.majors[String(m)];
    const previous = library.majors[String(m - 1)];
    const majorReleased = ANGULAR_RELEASES.find((release) => release.major === m)?.released;
    if (
      !current ||
      !previous ||
      current.version !== previous.version ||
      !majorReleased ||
      current.released >= majorReleased
    ) {
      break;
    }
    stale.push(m);
  }
  if (stale.length > 0) {
    take(
      'stale',
      5 * stale.length,
      `No release since Angular ${list(stale)} came out: ${library.majors[String(stale[0])]!.version} dates from before`,
    );
  }

  const version = support?.version ?? library.latest;
  if (/^0\./.test(version))
    take('maturity', 20, `${version} is a 0.x release: breaking changes may come with any version`);

  if (library.weeklyDownloads < POPULARITY_THRESHOLD) {
    take(
      'popularity',
      10,
      `${library.weeklyDownloads.toLocaleString('en')} weekly downloads on npm, under ${POPULARITY_THRESHOLD.toLocaleString('en')}`,
    );
  }

  if (library.deprecated !== null)
    take('maintenance', 30, `Deprecated on npm: ${library.deprecated}`);
  else if (library.archived) take('maintenance', 30, 'The repository is archived on GitHub');

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, grade: healthGrade(score), blocked: false, reasons };
}

/** The `SUPPORT_WINDOW` most recent majors up to `major`, newest first, within the tracked ones. */
export function recentMajors(major: number): number[] {
  return LIBRARY_MAJORS.filter((m) => m <= major)
    .sort((a, b) => b - a)
    .slice(0, SUPPORT_WINDOW);
}

function blockingVulnerability(support: MajorSupport | null): string | null {
  if (!support) return null;
  const critical = support.vulnerabilities.filter((v) => v.severity === 'critical').length;
  const high = support.vulnerabilities.filter((v) => v.severity === 'high').length;
  if (critical > 0)
    return `${plural(critical, 'critical vulnerability', 'critical vulnerabilities')} in ${support.version}`;
  if (high > 0)
    return `${plural(high, 'high-severity vulnerability', 'high-severity vulnerabilities')} in ${support.version}`;
  return null;
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** "22", "21 and 22", "20, 21 and 22" — ascending. */
function list(majors: number[]): string {
  const sorted = [...majors].sort((a, b) => a - b).map(String);
  return sorted.length <= 1
    ? (sorted[0] ?? '')
    : `${sorted.slice(0, -1).join(', ')} and ${sorted[sorted.length - 1]}`;
}
