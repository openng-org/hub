import { describe, expect, it } from 'vitest';

import { compareVersions, formatVersion, minorReleases, parseVersion } from './versions.ts';

const v = (tag: string) => parseVersion(tag)!;

describe('versions', () => {
  it('reads release tags, with or without "v", and nothing else', () => {
    expect(v('v22.1.0')).toEqual({ major: 22, minor: 1, patch: 0, pre: null });
    expect(formatVersion(v('22.2.0-next.3'))).toBe('22.2.0-next.3');
    expect(parseVersion('zone.js-0.15.0')).toBeNull();
    expect(parseVersion('22.1.x')).toBeNull();
  });

  it('orders pre-releases before their release, numerically', () => {
    const tags = ['22.1.1', '22.1.0', '22.1.0-rc.0', '22.1.0-next.10', '22.1.0-next.2', '21.2.24'];
    const sorted = [...tags].sort((a, b) => compareVersions(v(a), v(b)));
    expect(sorted).toEqual([
      '21.2.24',
      '22.1.0-next.2',
      '22.1.0-next.10',
      '22.1.0-rc.0',
      '22.1.0',
      '22.1.1',
    ]);
    expect(compareVersions(v('1.0.0-rc.1'), v('1.0.0-rc.1.1'))).toBeLessThan(0);
    expect(compareVersions(v('1.0.0-rc.1.1'), v('1.0.0-rc.1'))).toBeGreaterThan(0);
    expect(compareVersions(v('1.0.0-rc.1'), v('1.0.0-rc.1'))).toBe(0);
  });

  it('keeps the first release of each minor, oldest first', () => {
    const tags = ['v22.1.0', '22.0.1', '22.0.0', '21.2.0-rc.0', '12.0.0', 'v22.1.0-next.0', 'main'];
    expect(minorReleases(tags, 13).map((release) => release.tag)).toEqual(['22.0.0', 'v22.1.0']);
  });
});
