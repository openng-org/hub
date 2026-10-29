import { describe, expect, it } from 'vitest';

import { LIBRARY_MAJORS } from './health-score';
import { libraries, libraryHealth } from './index';

const CATEGORIES = new Set([
  'state',
  'data',
  'ui',
  'charts',
  'forms',
  'content',
  'i18n',
  'auth',
  'utilities',
  'testing',
  'tooling',
  'other',
]);

/** Guards for data PRs: a broken entry fails CI before it reaches the site. */
describe('tracked libraries', () => {
  it('have unique npm names and a known category', () => {
    const names = libraries.map((library) => library.name);
    expect(new Set(names).size).toBe(names.length);
    for (const library of libraries) {
      expect(library.name, library.name).toMatch(/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/);
      expect(CATEGORIES.has(library.category), library.name).toBe(true);
    }
  });
});

describe('library health', () => {
  it('describes tracked libraries only, with a version per tracked major', () => {
    const tracked = new Set(libraries.map((library) => library.name));
    for (const health of libraryHealth) {
      expect(tracked.has(health.name), health.name).toBe(true);
      expect(health.latest, health.name).toMatch(/^\d+\.\d+\.\d+/);
      expect(health.weeklyDownloads, health.name).toBeGreaterThanOrEqual(0);
      if (health.repository) expect(health.repository).toMatch(/^https:\/\/github\.com\//);
      expect(
        Object.keys(health.majors)
          .map(Number)
          .sort((a, b) => a - b),
      ).toEqual(LIBRARY_MAJORS);
      for (const support of Object.values(health.majors)) {
        if (!support) continue;
        expect(support.version, health.name).toMatch(/^\d+\.\d+\.\d+$/);
        expect(support.released, health.name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        for (const v of support.vulnerabilities) {
          expect(['critical', 'high', 'moderate', 'low']).toContain(v.severity);
          expect(v.url).toMatch(/^https:\/\//);
        }
      }
    }
  });
});
