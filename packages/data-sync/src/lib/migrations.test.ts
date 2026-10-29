import { describe, expect, it } from 'vitest';

import {
  collectMigrations,
  factorySources,
  migrationName,
  migrationVersion,
  type MigrationsSnapshot,
} from './migrations.ts';
import { parseVersion } from './versions.ts';

describe('migration helpers', () => {
  it('normalizes names and versions', () => {
    expect(migrationName('migration-v17-block-template-entities')).toBe('block-template-entities');
    expect(migrationName('migration-v9.1-undecorated')).toBe('undecorated');
    expect(migrationName('migration-x')).toBe('x');
    expect(migrationName('migration-01')).toBe('migration-01');
    expect(migrationVersion('9-beta')).toBe('9.0.0');
    expect(migrationVersion('9.0.0-beta')).toBe('9.0.0');
    expect(migrationVersion('13.1')).toBe('13.1.0');
    expect(migrationVersion('1000.0.0')).toBeNull();
    expect(migrationVersion(undefined)).toBeNull();
  });

  it('finds where the source of each factory style may be', () => {
    const core = 'packages/core/schematics/migrations';
    expect(factorySources('angular', './bundles/inject-flags.cjs#migrate')[0]).toBe(
      `${core}/inject-flags/index.ts`,
    );
    expect(factorySources('angular', './bundles/pending-tasks#migrate')[0]).toBe(
      `${core}/pending-tasks/index.ts`,
    );
    expect(factorySources('angular', './migrations/transfer-state/bundle')[0]).toBe(
      `${core}/transfer-state/index.ts`,
    );
    expect(factorySources('angular-cli', './update-17/replace-builders')).toEqual([
      'packages/schematics/angular/migrations/update-17/replace-builders.ts',
      'packages/schematics/angular/migrations/update-17/replace-builders/index.ts',
    ]);
  });
});

const snapshot = (
  repository: MigrationsSnapshot['repository'],
  ref: string,
  schematics: MigrationsSnapshot['schematics'],
): MigrationsSnapshot => ({ repository, ref, version: parseVersion(ref)!, schematics });

describe('collectMigrations', () => {
  it('merges the collections: every version, the newest wording, the first tag', () => {
    const migrations = collectMigrations([
      snapshot('angular', '21.0.0', {
        'control-flow': {
          version: '21.0.0',
          description: 'New wording',
          factory: './bundles/cf.cjs',
        },
        broken: { description: 'no version' },
      }),
      snapshot('angular', '20.0.0', {
        'control-flow': {
          version: '20.0.0',
          description: 'Old wording',
          factory: './migrations/cf/index',
          optional: true,
        },
      }),
      snapshot('angular', '20.1.0', {
        'control-flow': { version: '20.0.0', optional: false },
      }),
      snapshot('angular-cli', '20.0.0', { 'control-flow': { version: '20.0.0' } }),
    ]);
    expect(migrations).toEqual([
      {
        name: 'control-flow',
        repository: 'angular',
        description: 'New wording',
        factory: './migrations/cf/index',
        firstRef: '20.0.0',
        versions: [
          { version: '20.0.0', optional: false },
          { version: '21.0.0', optional: false },
        ],
      },
      {
        name: 'control-flow',
        repository: 'angular-cli',
        description: '',
        factory: null,
        firstRef: '20.0.0',
        versions: [{ version: '20.0.0', optional: false }],
      },
    ]);
  });
});
