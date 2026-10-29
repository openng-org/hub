import {
  findMigration,
  getAllMigrations,
  getMigrationMajors,
  getMigrationsForMajor,
  migrationExamples,
  type Migration,
} from '@openng/data-caniuse';
import { compareSemver, versionToRef } from '@openng/core-angular-versions';

import type {
  MigrationDetail,
  MigrationRef,
  MigrationRepository,
  MigrationsForMajor,
  MigrationTree,
  MigrationTreeNode,
} from '../../app/caniuse/data/api';
import { diffRows } from './diff';
import { matches, normalizeTerm } from '../text';

/** Below this many matching migrations (a search is active), every version starts open. */
const EXPAND_ALL_BELOW = 25;

const REPOSITORY_ORDER: MigrationRepository[] = ['angular', 'angular-cli'];

function repositoryOf(migration: Migration): MigrationRepository {
  return migration.repository === 'angular-cli' ? 'angular-cli' : 'angular';
}

export function toRef(migration: Migration): MigrationRef {
  const repository = repositoryOf(migration);
  return {
    name: migration.name,
    repository,
    description: migration.description,
    path: ['/caniuse', 'update', 'migrations', repository, migration.name],
  };
}

function search(term: string): Migration[] {
  return getAllMigrations().filter((migration) =>
    matches(term, migration.name, migration.description),
  );
}

/** Number of migrations matching a search (the tab badge). */
export function countMigrations(searchText = ''): number {
  return search(normalizeTerm(searchText)).length;
}

/**
 * The NG Update tree: version (newest first) → repository (angular, then angular-cli) → migration
 * (by name). A migration shipped in several versions appears under each, with that version's
 * optional flag. The newest version starts open, or all of them for a narrow search.
 */
export function migrationTree(searchText = ''): MigrationTree {
  const found = search(normalizeTerm(searchText));
  const byVersion = new Map<string, Map<MigrationRepository, Migration[]>>();
  for (const migration of found) {
    const repository = repositoryOf(migration);
    for (const { version } of migration.versions) {
      const repos = byVersion.get(version) ?? new Map<MigrationRepository, Migration[]>();
      byVersion.set(version, repos);
      repos.set(repository, [...(repos.get(repository) ?? []), migration]);
    }
  }
  const expandAll = found.length < EXPAND_ALL_BELOW;
  const nodes = [...byVersion.keys()]
    .sort((a, b) => compareSemver(b, a))
    .map((version, index): MigrationTreeNode => {
      const repos = byVersion.get(version)!;
      const children = REPOSITORY_ORDER.filter((repository) => repos.has(repository)).map(
        (repository): MigrationTreeNode => {
          const key = `${version}/${repository}`;
          const items = [...repos.get(repository)!].sort((a, b) => a.name.localeCompare(b.name));
          return {
            key,
            // Repositories open with their version: one click on a version shows its migrations.
            expanded: true,
            data: { kind: 'repository', key, repository, count: items.length },
            children: items.map((migration) => ({
              key: `${key}/${migration.name}`,
              leaf: true,
              data: {
                kind: 'migration',
                key: `${key}/${migration.name}`,
                migration: toRef(migration),
                optional: migration.versions.find((v) => v.version === version)?.optional ?? false,
              },
            })),
          };
        },
      );
      return {
        key: version,
        expanded: expandAll || index === 0,
        data: {
          kind: 'version',
          key: version,
          version,
          major: parseInt(version, 10),
          count: children.reduce((sum, child) => sum + (child.children?.length ?? 0), 0),
        },
        children,
      };
    });
  return { nodes, total: found.length };
}

/** Every major that has migrations, newest first. */
export const migrationMajors = getMigrationMajors;

export function migrationsForMajor(major: number): MigrationsForMajor {
  return {
    major,
    majors: migrationMajors(),
    migrations: getMigrationsForMajor(major)
      .sort((a, b) => compareSemver(a.versions[0]?.version ?? '', b.versions[0]?.version ?? ''))
      .map(toDetail),
  };
}

export function migrationDetail(repository: string, name: string): MigrationDetail | null {
  const migration = REPOSITORY_ORDER.includes(repository as MigrationRepository)
    ? findMigration(repository as MigrationRepository, name)
    : null;
  return migration ? toDetail(migration) : null;
}

/** Route params of every migration page (prerendering). */
export function migrationRefs(): MigrationRef[] {
  return getAllMigrations().map(toRef);
}

function toDetail(migration: Migration): MigrationDetail {
  const introduced = migration.versions[0]?.version ?? null;
  const example = migrationExamples.find((e) => e.name === migration.name);
  return {
    ...toRef(migration),
    introduced: introduced
      ? migration.versions.length > 1
        ? `Introduced ${introduced}`
        : introduced
      : null,
    sourceUrl: sourceUrl(migration),
    example: example
      ? {
          explanation: example.explanation ?? null,
          commitUrl: example.commitUrl ?? null,
          rows: example.before && example.after ? diffRows(example.before, example.after) : [],
        }
      : null,
  };
}

const SOURCES: Record<MigrationRepository, { base: string; path: string }> = {
  angular: {
    base: 'https://github.com/angular/angular/tree',
    path: 'packages/core/schematics',
  },
  'angular-cli': {
    base: 'https://github.com/angular/angular-cli/tree',
    path: 'packages/schematics/angular/migrations',
  },
};

/** Link to the migration's source folder at the version that introduced it. */
function sourceUrl(migration: Migration): string | null {
  if (!migration.factory || !migration.repository) return null;
  const entry = migration.versions[0];
  const version = (entry?.sourceVersion || entry?.version || '').replace(/^v/, '');
  if (!version) return null;
  const ref = versionToRef(version);
  const folder = migration.factory
    .replace(/^\.\//, '')
    .replace(/\/index$/, '')
    .replace(/#.*$/, '');
  const source = SOURCES[repositoryOf(migration)];
  return `${source.base}/${ref}/${source.path}/${folder}`;
}
