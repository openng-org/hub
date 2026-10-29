import { describe, expect, it } from 'vitest';

import evolution from '../data/angular-api-evolution.json';
import replacements from '../data/deprecated-replacements.json';
import { features } from './caniuse';
import { getAllMigrations } from './migrations';
import { getEslintCaniuseList } from './eslint';

const STATUSES = new Set(['experimental', 'preview', 'stable', 'deprecated', 'removed', null]);

/** Guards for community PRs: a broken entry fails CI before it reaches the site, the CLI or the MCP server. */
describe('curated Can I Use features', () => {
  it('have unique names and ids', () => {
    const names = features.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
    const ids = features.map((f) => f.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only use known statuses and ascending versions', () => {
    for (const feature of features) {
      let previous = 0;
      for (const entry of feature.versions) {
        expect(STATUSES.has(entry.status), `${feature.name} v${entry.version}`).toBe(true);
        expect(entry.version, `${feature.name}: versions must be ascending`).toBeGreaterThan(
          previous,
        );
        previous = entry.version;
      }
    }
  });
});

describe('public API evolution', () => {
  it('only uses known statuses, ascending versions, and replacements that exist', () => {
    const names = new Set(evolution.map((entry) => entry.name));
    for (const entry of evolution) {
      let previous = 0;
      for (const version of entry.versions) {
        expect(STATUSES.has(version.status), `${entry.name} v${version.version}`).toBe(true);
        expect(version.version, `${entry.name}: versions must be ascending`).toBeGreaterThan(
          previous,
        );
        previous = version.version;
      }
    }
    // An empty `replacedBy` means "deprecated without a replacement".
    for (const replacement of replacements) {
      expect(names.has(replacement.name), replacement.name).toBe(true);
      if (replacement.replacementUrl) {
        expect(replacement.replacementUrl, replacement.name).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('ng update migrations', () => {
  it('have a unique name, a known repository and at least one well-formed version', () => {
    const migrations = getAllMigrations();
    const keys = migrations.map((m) => `${m.repository ?? 'angular'}:${m.name}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const migration of migrations) {
      expect(migration.name).toBeTruthy();
      expect(['angular', 'angular-cli', undefined]).toContain(migration.repository);
      expect(migration.versions.length, migration.name).toBeGreaterThan(0);
      for (const entry of migration.versions) {
        expect(entry.version, migration.name).toMatch(/^\d+\.\d+(\.\d+)?/);
        expect(typeof entry.optional).toBe('boolean');
      }
    }
  });
});

describe('angular-eslint rules', () => {
  it('have a documentation url and a semver version', () => {
    for (const rule of getEslintCaniuseList()) {
      expect(rule.url).toMatch(/^https:\/\//);
      expect(rule.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});
