import { describe, expect, it } from 'vitest';

import { commits, commitUrl } from './commits';
import { githubReleases, migrationGuides, releases } from './index';

const STABLE = /^\d+\.\d+\.\d+$/;
const ANY_VERSION = /^\d+\.\d+\.\d+(-(next|rc)\.\d+)?$/;
const isUrl = (value: string | null | undefined) => !value || /^https:\/\//.test(value);

/** Guards for data PRs: a broken entry fails CI before it reaches the site. */
describe('releases', () => {
  it('have unique majors, newest first, with https links', () => {
    const majors = releases.map((r) => r.major);
    expect(new Set(majors).size).toBe(majors.length);
    expect([...majors].sort((a, b) => b - a)).toEqual(majors);
    for (const r of releases) expect(isUrl(r.announcementUrl), String(r.major)).toBe(true);
  });
});

describe('github releases', () => {
  it('have a version, a GitHub link and an ISO date', () => {
    for (const r of githubReleases) {
      expect(r.version, r.link).toMatch(ANY_VERSION);
      expect(r.link, r.version).toMatch(/^https:\/\/github\.com\/angular\//);
      expect(Number.isNaN(Date.parse(r.releaseDate)), r.version).toBe(false);
    }
  });
});

describe('commits', () => {
  it('belong to stable releases and link to GitHub', () => {
    for (const c of commits) {
      expect(c.version, c.sha).toMatch(STABLE);
      expect(['angular', 'angular-cli'], c.sha).toContain(c.repository);
      expect(c.sha, c.description).toMatch(/^[0-9a-f]{7,40}$/);
      expect(c.type, c.sha).not.toBe('');
    }
    expect(commitUrl({ repository: 'angular-cli', sha: 'abc1234' })).toBe(
      'https://github.com/angular/angular-cli/commit/abc1234',
    );
  });
});

describe('migration guides', () => {
  it('target a known major, with unique change ids', () => {
    const majors = new Set(releases.map((r) => r.major));
    for (const guide of migrationGuides) {
      expect(majors.has(guide.majorVersion), guide.version).toBe(true);
      expect(guide.version.startsWith(`${guide.majorVersion}.`), guide.version).toBe(true);
      const ids = guide.changes.map((c) => c.id);
      expect(new Set(ids).size, guide.version).toBe(ids.length);
      for (const change of guide.changes) {
        expect(change.steps.length, change.id).toBeGreaterThan(0);
        for (const link of change.links ?? []) expect(isUrl(link.url), change.id).toBe(true);
      }
    }
  });
});
