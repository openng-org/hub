import { describe, expect, it } from 'vitest';

import { getEslintCaniuseList, getFilteredEslintCaniuseList } from './eslint';
import {
  findMigration,
  getAllMigrations,
  getFeatures,
  getFeaturesWithStageChanges,
  getMandatoryMigrations,
  getMigrationMajors,
  getMigrationsForMajor,
  getOptionalMigrations,
  getPackages,
  migrationExamples,
} from './index';
import { features } from './caniuse';

describe('features', () => {
  const all = getFeatures();

  it('merges the curated features and the deprecated public API, each name once', () => {
    expect(all.length).toBeGreaterThan(features.length);
    const names = all.map((feature) => feature.name);
    expect(new Set(names).size).toBe(names.length);
    for (const feature of features) expect(all).toContain(feature);
  });

  it('puts the features whose status just changed first, and keeps the result stable', () => {
    const recent = (feature: (typeof all)[number]) => {
      const [last, previous] = [...feature.versions].sort((a, b) => b.version - a.version);
      return !!previous && last!.status !== previous.status;
    };
    const flags = all.map(recent);
    const firstOld = flags.indexOf(false);
    expect(flags.slice(firstOld).every((flag) => !flag)).toBe(true);
    expect(getFeatures()).toBe(all);
  });

  it('links a still-deprecated API to its documentation and replacement', () => {
    const deprecated = all.filter(
      (feature) =>
        feature.versions.at(-1)?.status === 'deprecated' && feature.metadata?.referenceUrl,
    );
    expect(deprecated.length).toBeGreaterThan(0);
    for (const feature of deprecated) {
      expect(feature.metadata!.referenceUrl).toMatch(/^https:\/\/angular\.dev\/api\//);
    }
    expect(deprecated.some((feature) => feature.metadata?.replacedBy)).toBe(true);
  });

  it('lists packages in first-seen order, without duplicates', () => {
    const packages = getPackages();
    expect(packages[0]).toBe(all.find((feature) => feature.package)!.package);
    expect(new Set(packages).size).toBe(packages.length);
    expect(packages).toContain('@angular/core');
  });
});

describe('stage changes', () => {
  const majors = [16, 17, 18, 19, 20];

  it('reports nothing for the oldest known major and only real changes elsewhere', () => {
    expect(getFeaturesWithStageChanges(16, majors)).toEqual([]);
    const changes = getFeaturesWithStageChanges(19, majors);
    expect(changes.length).toBeGreaterThan(0);
    for (const change of changes) {
      const versions = change.feature.versions.map((v) => v.version);
      if (change.changeType === 'removed') {
        expect(Math.max(...versions)).toBeLessThan(19);
        expect(change.currentStatus).toBeNull();
      } else {
        expect(versions.some((v) => v >= 19 && v < 20)).toBe(true);
        expect(change.currentStatus?.version).toBeGreaterThanOrEqual(19);
      }
      if (change.changeType === 'new') {
        // "Not available" entries (status null) may precede a feature's first real status.
        expect(change.previousStatus?.status ?? null).toBeNull();
        expect(change.introducedInVersion).toBe(true);
      }
      if (change.changeType === 'status-change') {
        expect(change.previousStatus?.status).not.toBe(change.currentStatus?.status);
      }
    }
  });

  it('orders new features, then status changes, then removals, by name', () => {
    const changes = getFeaturesWithStageChanges(19, majors);
    const rank = { new: 0, 'status-change': 1, removed: 2 };
    for (let i = 1; i < changes.length; i++) {
      const [a, b] = [changes[i - 1]!, changes[i]!];
      const order =
        rank[a.changeType] - rank[b.changeType] || a.feature.name.localeCompare(b.feature.name);
      expect(order).toBeLessThanOrEqual(0);
    }
  });
});

describe('migrations', () => {
  it('knows every major that ships migrations, newest first', () => {
    const majors = getMigrationMajors();
    expect([...majors].sort((a, b) => b - a)).toEqual(majors);
    for (const major of majors) expect(getMigrationsForMajor(major).length).toBeGreaterThan(0);
    expect(getMigrationsForMajor(3)).toEqual([]);
  });

  it('splits optional and mandatory migrations of a major', () => {
    const major = getMigrationMajors()[0]!;
    const optional = getOptionalMigrations(major);
    const mandatory = getMandatoryMigrations(major);
    expect(optional.length + mandatory.length).toBeGreaterThanOrEqual(
      getMigrationsForMajor(major).length,
    );
    for (const migration of optional) {
      expect(migration.versions.some((v) => v.optional && v.version.startsWith(`${major}.`))).toBe(
        true,
      );
    }
  });

  it('finds a migration by repository and name', () => {
    const migration = getAllMigrations()[0]!;
    expect(findMigration(migration.repository, migration.name)).toBe(migration);
    expect(findMigration('angular-cli', 'does-not-exist')).toBeNull();
  });

  it('ships examples with a name and something to show', () => {
    expect(migrationExamples.length).toBeGreaterThan(0);
    for (const example of migrationExamples) {
      expect(example.name).toBeTruthy();
      expect(example.explanation || example.before || example.after).toBeTruthy();
    }
  });
});

describe('ESLint rules', () => {
  it('lists rules newest version first and filters by type and search', () => {
    const rules = getEslintCaniuseList();
    expect(rules.length).toBeGreaterThan(0);
    expect(getFilteredEslintCaniuseList()).toEqual(rules);
    const template = getFilteredEslintCaniuseList({ type: 'eslint-plugin-template' });
    expect(template.length).toBeGreaterThan(0);
    expect(template.every((rule) => rule.type === 'eslint-plugin-template')).toBe(true);
    const search = getFilteredEslintCaniuseList({ search: 'SIGNAL' });
    expect(search.length).toBeGreaterThan(0);
    expect(
      search.every((rule) => /signal/i.test(rule.name) || /signal/i.test(rule.description)),
    ).toBe(true);
    expect(getFilteredEslintCaniuseList({ search: 'zzz-no-such-rule' })).toEqual([]);
  });
});
