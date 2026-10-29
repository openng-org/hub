/**
 * Release dates and support windows of every Angular major.
 *
 * Release dates: the x.0.0 release of angular/angular. Active and LTS end dates: only for the majors
 * still supported, as published on https://angular.dev/reference/releases (month precision when
 * that is all the page gives). Update this list with each major and when angular.dev updates the
 * table; everything else derives from it.
 */
export interface AngularRelease {
  major: number;
  /** ISO day of the x.0.0 release. */
  released: string;
  /** End of active support ("YYYY-MM-DD" or "YYYY-MM"), for supported majors. */
  activeEnds?: string;
  /** End of long-term support ("YYYY-MM-DD" or "YYYY-MM"), for supported majors. */
  ltsEnds?: string;
}

export const ANGULAR_RELEASES: AngularRelease[] = [
  { major: 22, released: '2026-06-03', activeEnds: '2027-06', ltsEnds: '2028-06' },
  { major: 21, released: '2025-11-19', activeEnds: '2026-06-03', ltsEnds: '2027-06' },
  { major: 20, released: '2025-05-28', activeEnds: '2025-11-19', ltsEnds: '2026-11-28' },
  { major: 19, released: '2024-11-19' },
  { major: 18, released: '2024-05-22' },
  { major: 17, released: '2023-11-08' },
  { major: 16, released: '2023-05-03' },
  { major: 15, released: '2022-11-16' },
  { major: 14, released: '2022-06-02' },
  { major: 13, released: '2021-11-03' },
  { major: 12, released: '2021-05-12' },
  { major: 11, released: '2020-11-11' },
  { major: 10, released: '2020-06-24' },
  { major: 9, released: '2020-02-06' },
  { major: 8, released: '2019-05-28' },
  { major: 7, released: '2018-10-18' },
  { major: 6, released: '2018-05-03' },
  { major: 5, released: '2017-11-01' },
  { major: 4, released: '2017-03-23' },
  { major: 2, released: '2016-09-14' },
];

/** `upcoming` is a major whose release day has not come yet (listed ahead of a release). */
export type SupportStatus = 'upcoming' | 'active' | 'lts' | 'eol';

/** The last day of a "YYYY-MM-DD" or "YYYY-MM" date ("2027-06" → "2027-06-30"). */
export function endOfPeriod(date: string): string {
  if (date.length > 7) return date;
  const [year, month] = date.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

/**
 * Support status of a major on an ISO day: upcoming (not released yet), active, LTS, or end of life
 * (no dates = ended).
 */
export function supportStatus(release: AngularRelease, today: string): SupportStatus {
  if (today < release.released) return 'upcoming';
  if (!release.ltsEnds || today > endOfPeriod(release.ltsEnds)) return 'eol';
  if (release.activeEnds && today <= endOfPeriod(release.activeEnds)) return 'active';
  return 'lts';
}
