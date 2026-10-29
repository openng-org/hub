import { describe, expect, it } from 'vitest';

import { ANGULAR_VERSIONS } from './versions';
import { ANGULAR_RELEASES, endOfPeriod, supportStatus } from './support';

describe('support windows', () => {
  it('lists every major once, newest first, with ordered dates', () => {
    expect(ANGULAR_RELEASES.map((r) => r.major)).toEqual([...ANGULAR_VERSIONS].reverse());
    const days = ANGULAR_RELEASES.map((r) => r.released);
    expect([...days].sort().reverse()).toEqual(days);
    for (const release of ANGULAR_RELEASES) {
      if (release.activeEnds && release.ltsEnds) {
        expect(endOfPeriod(release.activeEnds) < endOfPeriod(release.ltsEnds)).toBe(true);
      }
    }
  });

  it('derives the status from the date', () => {
    const v20 = ANGULAR_RELEASES.find((r) => r.major === 20)!;
    expect(supportStatus(v20, '2025-06-01')).toBe('active');
    expect(supportStatus(v20, '2026-01-01')).toBe('lts');
    expect(supportStatus(v20, '2026-11-29')).toBe('eol');
    expect(supportStatus(ANGULAR_RELEASES.at(-1)!, '2016-10-01')).toBe('eol');
    expect(endOfPeriod('2027-06')).toBe('2027-06-30');
  });

  it('calls a major upcoming before its release day', () => {
    const v23 = { major: 23, released: '2026-11-18', activeEnds: '2027-05', ltsEnds: '2028-05' };
    expect(supportStatus(v23, '2026-10-29')).toBe('upcoming');
    expect(supportStatus(v23, '2026-11-18')).toBe('active');
    // Without support dates a past release has ended; a future one is still upcoming.
    expect(supportStatus({ major: 23, released: '2026-11-18' }, '2026-10-29')).toBe('upcoming');
    expect(supportStatus({ major: 23, released: '2026-11-18' }, '2026-11-18')).toBe('eol');
  });
});
