import { describe, expect, it } from 'vitest';

import { healthScore, LIBRARY_MAJORS, recentMajors } from './health-score';
import type { LibraryHealth, MajorSupport, Vulnerability } from './models';

const latest = LIBRARY_MAJORS[LIBRARY_MAJORS.length - 1]!;

const support = (
  version: string,
  vulnerabilities: Vulnerability[] = [],
  released = '2099-01-01',
): MajorSupport => ({
  version,
  peer: `^${version.split('.')[0]}.0.0`,
  released,
  vulnerabilities,
});
const vuln = (severity: Vulnerability['severity']): Vulnerability => ({
  id: `GHSA-${severity}`,
  severity,
  summary: 'Something',
  url: 'https://osv.dev/',
});

/** A healthy library: a release for every tracked major, same version number as the major. */
function healthy(overrides: Partial<LibraryHealth> = {}): LibraryHealth {
  return {
    name: 'lib',
    description: null,
    repository: null,
    license: 'MIT',
    latest: `${latest}.0.0`,
    latestReleased: '2026-01-01',
    weeklyDownloads: 50_000,
    deprecated: null,
    archived: false,
    majors: Object.fromEntries(LIBRARY_MAJORS.map((m) => [String(m), support(`${m}.0.0`)])),
    ...overrides,
  };
}

describe('healthScore', () => {
  it('gives a healthy library 100', () => {
    expect(healthScore(healthy(), latest)).toEqual({
      score: 100,
      grade: 'good',
      blocked: false,
      reasons: [],
    });
  });

  it('blocks on a critical or high vulnerability of the recommended version', () => {
    const lib = healthy({
      majors: { ...healthy().majors, [latest]: support('9.0.0', [vuln('high'), vuln('low')]) },
    });
    const result = healthScore(lib, latest);
    expect(result).toMatchObject({ score: 0, grade: 'poor', blocked: true });
    expect(result.reasons[0]?.detail).toBe('1 high-severity vulnerability in 9.0.0');
    // The major before is served by a version without the vulnerability.
    expect(healthScore(lib, latest - 1).score).toBe(100);
  });

  it('takes points for moderate and low vulnerabilities', () => {
    const lib = healthy({
      majors: {
        ...healthy().majors,
        [latest]: support('9.0.0', [vuln('moderate'), vuln('moderate'), vuln('low')]),
      },
    });
    const result = healthScore(lib, latest);
    expect(result.score).toBe(88);
    expect(result.reasons.map((r) => r.points)).toEqual([10, 2]);
  });

  it('takes 10 points per recent major without support', () => {
    const majors = { ...healthy().majors, [latest]: null, [latest - 1]: null };
    const result = healthScore(healthy({ majors }), latest);
    expect(result.score).toBe(80);
    expect(result.reasons[0]?.detail).toBe(
      `No stable version supports Angular ${latest - 1} and ${latest}`,
    );
    expect(healthScore(healthy({ majors: { [latest - 2]: null } }), latest).score).toBe(70);
    expect(healthScore(healthy({ majors: {} }), latest).reasons[0]?.detail).toBe(
      `No stable version supports Angular ${latest - 2}, ${latest - 1} and ${latest}`,
    );
  });

  it('takes 5 points per recent major served by an older release than the major', () => {
    const old = support(`${latest - 2}.0.0`, [], '2000-01-01');
    const majors = { ...healthy().majors, [latest]: old, [latest - 1]: old, [latest - 2]: old };
    const result = healthScore(healthy({ majors }), latest);
    expect(result.score).toBe(90);
    expect(result.reasons[0]).toMatchObject({ rule: 'stale', points: 10 });
    expect(result.reasons[0]?.detail).toContain(`Angular ${latest - 1} and ${latest}`);
    // The same version everywhere, but published after the latest major came out: not stale.
    const fresh = support(`${latest - 2}.0.0`, [], '2099-01-01');
    const recent = {
      ...healthy().majors,
      [latest]: fresh,
      [latest - 1]: fresh,
      [latest - 2]: fresh,
    };
    expect(healthScore(healthy({ majors: recent }), latest).score).toBe(100);
  });

  it('takes points for 0.x versions, few downloads, and abandoned packages', () => {
    expect(
      healthScore(healthy({ majors: { ...healthy().majors, [latest]: support('0.9.0') } }), latest)
        .score,
    ).toBe(80);
    expect(healthScore(healthy({ weeklyDownloads: 999 }), latest).score).toBe(90);
    expect(healthScore(healthy({ deprecated: 'Use x instead' }), latest).score).toBe(70);
    expect(healthScore(healthy({ archived: true }), latest).score).toBe(70);
    // Deprecated wins over archived: one maintenance penalty.
    expect(healthScore(healthy({ deprecated: 'x', archived: true }), latest).score).toBe(70);
  });

  it('skips the support rules for a library that declares no Angular peer range', () => {
    const undeclared = { ...support('3.0.0'), peer: null };
    const majors = Object.fromEntries(LIBRARY_MAJORS.map((m) => [String(m), undeclared]));
    expect(healthScore(healthy({ majors }), latest).score).toBe(100);
  });

  it('never goes under 0, and grades the result', () => {
    const result = healthScore(
      healthy({ majors: {}, weeklyDownloads: 0, archived: true, latest: '0.1.0' }),
      latest,
    );
    expect(result).toMatchObject({ score: 10, grade: 'poor' });
    expect(healthScore(healthy({ weeklyDownloads: 0, archived: true }), latest).grade).toBe('fair');
  });

  it('looks at the three most recent tracked majors up to the one asked', () => {
    expect(recentMajors(latest)).toEqual([latest, latest - 1, latest - 2]);
    expect(recentMajors(LIBRARY_MAJORS[0]!)).toEqual([LIBRARY_MAJORS[0]]);
  });
});

describe('unavailable rules', () => {
  it('skips the rules whose data could not be read', () => {
    const library = {
      name: 'x',
      description: null,
      repository: null,
      license: null,
      latest: '1.0.0',
      latestReleased: '2026-01-01',
      weeklyDownloads: 0,
      deprecated: null,
      archived: false,
      majors: Object.fromEntries(
        LIBRARY_MAJORS.map((m) => [
          String(m),
          {
            version: '1.0.0',
            peer: `^${m}.0.0`,
            released: '2099-01-01',
            vulnerabilities: [{ id: 'GHSA-1', severity: 'critical', summary: 's', url: 'u' }],
          },
        ]),
      ),
    } satisfies LibraryHealth;
    expect(healthScore(library, LIBRARY_MAJORS.at(-1)!).score).toBe(0);
    const partial = healthScore(library, LIBRARY_MAJORS.at(-1)!, {
      unavailable: ['vulnerabilities', 'popularity'],
    });
    expect(partial).toMatchObject({ score: 100, blocked: false, reasons: [] });
  });
});
