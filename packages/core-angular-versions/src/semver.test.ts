import { describe, expect, it } from 'vitest';

import { angularVersionCompatibility } from './compatibility';
import {
  compareSemver,
  majorOf,
  normalizeSemver,
  stripVersionPrefix,
  versionToRef,
} from './semver';
import { ANGULAR_MAJORS_DESC, ANGULAR_VERSIONS, LATEST_MAJOR } from './versions';

describe('versions', () => {
  it('are unique, ascending majors with the latest derived', () => {
    expect(new Set(ANGULAR_VERSIONS).size).toBe(ANGULAR_VERSIONS.length);
    expect([...ANGULAR_VERSIONS].sort((a, b) => a - b)).toEqual(ANGULAR_VERSIONS);
    expect(LATEST_MAJOR).toBe(ANGULAR_VERSIONS.at(-1));
    expect(ANGULAR_MAJORS_DESC[0]).toBe(LATEST_MAJOR);
  });

  it('each have a compatibility entry (Node, TypeScript, RxJS)', () => {
    for (const major of ANGULAR_VERSIONS) {
      const entry = angularVersionCompatibility.find((row) => majorOf(row.angular) === major);
      expect(entry, `Angular ${major}`).toBeDefined();
      expect(entry!.node, `Angular ${major}`).not.toBe('');
      expect(entry!.typescript, `Angular ${major}`).not.toBe('');
    }
  });
});

describe('semver helpers', () => {
  it.each([
    ['21.1.0', 21],
    ['v21.1.0', 21],
    ['^21', 21],
    ['21', 21],
    ['22.0.x', 22],
  ])('majorOf(%s) = %i', (version, major) => {
    expect(majorOf(version)).toBe(major);
  });

  it('majorOf is NaN without a leading number', () => {
    expect(majorOf('next')).toBeNaN();
  });

  it.each([
    ['v9', '9.0.0'],
    ['9-beta', '9.0.0'],
    ['9.1-rc.1', '9.1.0'],
    ['9.1.2+build', '9.1.2'],
    ['21.1.0', '21.1.0'],
    ['garbage', 'garbage'],
  ])('normalizeSemver(%s) = %s', (input, output) => {
    expect(normalizeSemver(input)).toBe(output);
  });

  it('strips a leading v only', () => {
    expect(stripVersionPrefix('v21.0.0')).toBe('21.0.0');
    expect(stripVersionPrefix('21.0.0')).toBe('21.0.0');
  });

  it('prefixes GitHub refs with v from 21.1.0 on', () => {
    expect(versionToRef('21.0.5')).toBe('21.0.5');
    expect(versionToRef('21.1.0')).toBe('v21.1.0');
    expect(versionToRef('22.0.0')).toBe('v22.0.0');
    expect(versionToRef('20.3.1')).toBe('20.3.1');
  });

  it('compares numerically, prefix and partial versions included', () => {
    expect(compareSemver('21.1.0', 'v21.1')).toBe(0);
    expect(compareSemver('9', '10.0.0')).toBeLessThan(0);
    expect(compareSemver('21.10.0', '21.9.9')).toBeGreaterThan(0);
    expect(['21.1.0', '9.0.0', '21.0.5'].sort(compareSemver)).toEqual([
      '9.0.0',
      '21.0.5',
      '21.1.0',
    ]);
  });
});
