/**
 * The home page's release timeline: every Angular major on one axis, from Angular 2 to the end of
 * the newest major's long-term support, with the support windows of the majors still supported.
 * Positions are percentages of the axis, so the page only places what it gets.
 */
import {
  ANGULAR_RELEASES,
  endOfPeriod,
  supportStatus,
  type AngularRelease,
  type SupportStatus,
} from '@openng/core-angular-versions';

import type { ReleaseTimeline, TimelineSegment } from '../app/features/home/home-api';
import { MONTHS, todayIso } from './community/dates';
import { isReleaseMajor } from './releases/versions';

const STATUS_LABELS: Record<SupportStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  lts: 'LTS',
  eol: 'End of life',
};
const STATUS_ORDER: readonly SupportStatus[] = ['upcoming', 'active', 'lts', 'eol'];

const time = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

/** "Jun 2027" from "2027-06-30" or "2027-06". */
function monthYear(date: string): string {
  const [year, month] = date.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** "Jun 3, 2026". */
function longDay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The timeline on a given day, from a list of releases (newest first; the real one by default,
 * fixtures in tests).
 */
export function releaseTimeline(
  today = todayIso(),
  releases: readonly AngularRelease[] = ANGULAR_RELEASES,
): ReleaseTimeline {
  const oldest = releases.at(-1)!;
  const lastDay = releases
    .flatMap((r) => (r.ltsEnds ? [endOfPeriod(r.ltsEnds)] : [r.released]))
    .sort()
    .at(-1)!;
  const firstYear = Number(oldest.released.slice(0, 4));
  const lastYear = Number(lastDay.slice(0, 4));
  const start = time(`${firstYear}-01-01`);
  const end = time(`${lastYear + 1}-01-01`);
  const offset = (iso: string) => round(((time(iso) - start) / (end - start)) * 100);

  const majors = [...releases].reverse().map((release, index) => {
    const status = supportStatus(release, today);
    return {
      major: release.major,
      label: `v${release.major}`,
      released: longDay(release.released),
      releasedIso: release.released,
      status,
      statusLabel: STATUS_LABELS[status],
      offset: offset(release.released),
      lane: (index % 2) as 0 | 1,
      link: isReleaseMajor(release.major) ? ['/releases', String(release.major)] : null,
    };
  });

  const supported = releases
    .filter(
      (release) => release.activeEnds && release.ltsEnds && supportStatus(release, today) !== 'eol',
    )
    .reverse()
    .map((release) => {
      const activeEnds = endOfPeriod(release.activeEnds!);
      const ltsEnds = endOfPeriod(release.ltsEnds!);
      const status = supportStatus(release, today);
      const segments: TimelineSegment[] = [
        {
          kind: 'active',
          start: offset(release.released),
          width: round(offset(activeEnds) - offset(release.released)),
          label: `Active until ${monthYear(release.activeEnds!)}`,
        },
        {
          kind: 'lts',
          start: offset(activeEnds),
          width: round(offset(ltsEnds) - offset(activeEnds)),
          label: `LTS until ${monthYear(release.ltsEnds!)}`,
        },
      ];
      return {
        major: release.major,
        label: `Angular ${release.major}`,
        status,
        statusLabel: STATUS_LABELS[status],
        summary:
          status === 'lts'
            ? `LTS until ${monthYear(release.ltsEnds!)}`
            : `${status === 'upcoming' ? `Expected ${longDay(release.released)}, active` : 'Active'} until ${monthYear(release.activeEnds!)}, then LTS until ${monthYear(release.ltsEnds!)}`,
        segments,
        link: isReleaseMajor(release.major) ? ['/releases', String(release.major)] : null,
      };
    });

  const years = [];
  for (let year = firstYear; year <= lastYear; year++) {
    years.push({ label: String(year), offset: offset(`${year}-01-01`) });
  }

  const counts = majors.reduce(
    (acc, major) => ({ ...acc, [major.status]: acc[major.status] + 1 }),
    { upcoming: 0, active: 0, lts: 0, eol: 0 } as Record<SupportStatus, number>,
  );

  return {
    years,
    today: { offset: offset(today), label: longDay(today) },
    majors,
    supported,
    // Only the statuses in use: "Upcoming" appears when a major is announced ahead of its release.
    legend: STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: counts[status],
    })),
    source: 'https://angular.dev/reference/releases',
  };
}
