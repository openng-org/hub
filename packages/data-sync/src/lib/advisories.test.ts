import { describe, expect, it } from 'vitest';

import { affectedVersions, inVulnerableRange, type GithubAdvisory } from './advisories.ts';

const advisory = (
  id: string,
  severity: GithubAdvisory['severity'],
  ranges: [string, string][],
  withdrawn: string | null = null,
): GithubAdvisory => ({
  ghsa_id: id,
  summary: ` Summary of ${id} `,
  severity,
  html_url: `https://github.com/advisories/${id}`,
  withdrawn_at: withdrawn,
  vulnerabilities: ranges.map(([name, range]) => ({
    package: { ecosystem: 'npm', name },
    vulnerable_version_range: range,
  })),
});

describe('advisories', () => {
  it('reads GitHub ranges', () => {
    expect(inVulnerableRange('1.1.0', '>= 1.0.0, < 1.2.3')).toBe(true);
    expect(inVulnerableRange('1.2.3', '>= 1.0.0, < 1.2.3')).toBe(false);
    expect(inVulnerableRange('2.0.0', '<= 2.0.0')).toBe(true);
    expect(inVulnerableRange('2.0.0', '= 2.0.0')).toBe(true);
    expect(inVulnerableRange('2.0.0', null)).toBe(false);
    expect(inVulnerableRange('2.0.0', 'nonsense')).toBe(false);
  });

  it('maps each asked version to the advisories affecting it', () => {
    const found = affectedVersions(
      [
        { name: 'lib', version: '1.1.0' },
        { name: 'lib', version: '2.0.0' },
        { name: 'other', version: '1.1.0' },
      ],
      [
        advisory('GHSA-b', 'medium', [['lib', '< 1.2.0']]),
        advisory('GHSA-a', 'high', [
          ['lib', '< 3.0.0'],
          ['lib', '< 1.0.0'],
        ]),
        advisory('GHSA-w', 'critical', [['lib', '< 3.0.0']], '2025-01-01T00:00:00Z'),
        advisory('GHSA-u', 'unknown', [['lib', '< 3.0.0']]),
        advisory('GHSA-o', 'low', [['unrelated', '< 3.0.0']]),
      ],
    );
    expect(found.get('lib@1.1.0')).toEqual([
      {
        id: 'GHSA-a',
        severity: 'high',
        summary: 'Summary of GHSA-a',
        url: 'https://github.com/advisories/GHSA-a',
      },
      {
        id: 'GHSA-b',
        severity: 'moderate',
        summary: 'Summary of GHSA-b',
        url: 'https://github.com/advisories/GHSA-b',
      },
    ]);
    expect(found.get('lib@2.0.0')?.map((v) => v.id)).toEqual(['GHSA-a']);
    expect(found.has('other@1.1.0')).toBe(false);
  });
});
