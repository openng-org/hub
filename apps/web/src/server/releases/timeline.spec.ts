import { describe, expect, it } from 'vitest';

import { releaseTimeline } from './timeline';

describe('releaseTimeline', () => {
  const timeline = releaseTimeline('2026-10-29');

  it('places every major on the axis, oldest first', () => {
    const offsets = timeline.majors.map((major) => major.offset);
    expect(timeline.majors[0]!.major).toBe(2);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
    expect(offsets.every((offset) => offset >= 0 && offset <= 100)).toBe(true);
    expect(timeline.years[0]).toEqual({ label: '2016', offset: 0 });
  });

  it('gives each major its status on the day', () => {
    const status = Object.fromEntries(timeline.majors.map((m) => [m.major, m.status]));
    expect(status).toMatchObject({ 19: 'eol', 20: 'lts', 21: 'lts', 22: 'active' });
    expect(timeline.legend).toEqual([
      { status: 'active', label: 'Active', count: 1 },
      { status: 'lts', label: 'LTS', count: 2 },
      { status: 'eol', label: 'End of life', count: 17 },
    ]);
  });

  it('draws the windows of the supported majors only', () => {
    expect(timeline.supported.map((row) => row.major)).toEqual([20, 21, 22]);
    const v22 = timeline.supported.at(-1)!;
    expect(v22.summary).toBe('Active until Jun 2027, then LTS until Jun 2028');
    const [active, lts] = v22.segments;
    expect(active!.start + active!.width).toBeCloseTo(lts!.start, 1);
    expect(lts!.start + lts!.width).toBeLessThanOrEqual(100);
    // Angular 20 drops out once its LTS ends.
    expect(releaseTimeline('2026-12-01').supported.map((row) => row.major)).toEqual([21, 22]);
  });
});

describe('releaseTimeline on fixtures', () => {
  const releases = [
    { major: 23, released: '2026-11-18', activeEnds: '2027-05', ltsEnds: '2028-05' },
    { major: 22, released: '2026-06-03', activeEnds: '2027-06', ltsEnds: '2028-06' },
    { major: 21, released: '2025-11-19', activeEnds: '2026-06-03', ltsEnds: '2027-06' },
    { major: 20, released: '2025-05-28' },
  ];

  it('marks an announced major as upcoming and lists that status in the legend', () => {
    const timeline = releaseTimeline('2026-10-29', releases);
    const v23 = timeline.majors.at(-1)!;
    expect(v23).toMatchObject({ major: 23, status: 'upcoming', statusLabel: 'Upcoming' });
    expect(timeline.legend).toEqual([
      { status: 'upcoming', label: 'Upcoming', count: 1 },
      { status: 'active', label: 'Active', count: 1 },
      { status: 'lts', label: 'LTS', count: 1 },
      { status: 'eol', label: 'End of life', count: 1 },
    ]);
    expect(timeline.supported.at(-1)!.summary).toBe(
      'Expected Nov 18, 2026, active until May 2027, then LTS until May 2028',
    );
  });

  it('spans whole years from the first release to the end of the last LTS', () => {
    const timeline = releaseTimeline('2026-10-29', releases);
    expect(timeline.years.map((year) => year.label)).toEqual(['2025', '2026', '2027', '2028']);
    expect(timeline.years[0]!.offset).toBe(0);
    expect(timeline.today.offset).toBeGreaterThan(timeline.majors.at(-2)!.offset);
    expect(timeline.today.offset).toBeLessThan(timeline.majors.at(-1)!.offset);
    expect(timeline.today.label).toBe('Oct 29, 2026');
  });

  it('ends the axis with the newest release when no major has support dates', () => {
    const timeline = releaseTimeline('2026-10-29', [
      { major: 20, released: '2025-05-28' },
      { major: 19, released: '2024-11-19' },
    ]);
    expect(timeline.years.map((year) => year.label)).toEqual(['2024', '2025']);
    expect(timeline.supported).toEqual([]);
    expect(timeline.legend).toEqual([{ status: 'eol', label: 'End of life', count: 2 }]);
  });
});
