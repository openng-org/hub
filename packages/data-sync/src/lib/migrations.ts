import { compareVersions, parseVersion, type Version } from './versions.ts';

export type Repository = 'angular' | 'angular-cli';

/** An entry of a `migrations.json` (ng update schematics collection). */
export interface SchematicEntry {
  version?: string;
  description?: string;
  factory?: string;
  optional?: boolean;
}

/** The migrations collection of a repository at one release. */
export interface MigrationsSnapshot {
  repository: Repository;
  /** The git tag read. */
  ref: string;
  version: Version;
  schematics: Record<string, SchematicEntry>;
}

/** A migration and every version it ships in, before its source link is resolved. */
export interface CollectedMigration {
  name: string;
  repository: Repository;
  description: string;
  /** The factory as the first collection shipping it declares it… */
  factory: string | null;
  /** …at this tag: where the source link points. */
  firstRef: string;
  versions: { version: string; optional: boolean }[];
}

/** Where each repository keeps its collection, and what its factories are relative to. */
export const COLLECTIONS: Record<Repository, { file: string; root: string }> = {
  angular: {
    file: 'packages/core/schematics/migrations.json',
    root: 'packages/core/schematics',
  },
  'angular-cli': {
    file: 'packages/schematics/angular/migrations/migration-collection.json',
    root: 'packages/schematics/angular/migrations',
  },
};

/**
 * "migration-v17-block-template-entities" → "block-template-entities"; the CLI's numbered
 * migrations of v6 to v9 keep their key ("migration-01").
 */
export function migrationName(key: string): string {
  const name = key.replace(/^migration-v[\d.]+-/, '').replace(/^migration-/, '');
  return /^\d+$/.test(name) ? key : name;
}

/** "9-beta", "9.0.0-beta", "13.1" → "9.0.0", "9.0.0", "13.1.0"; null when it is not a version. */
export function migrationVersion(value: string | undefined): string | null {
  const match = /^(\d{1,2})(?:\.(\d+))?(?:\.(\d+))?(?![\d.])/.exec(value ?? '');
  return match ? `${match[1]}.${match[2] ?? 0}.${match[3] ?? 0}` : null;
}

/**
 * Where the source of a factory may be, from the repository root, most likely first. Factories
 * name a built file: `./bundles/<name>.cjs#migrate` and `./migrations/<name>/bundle` are built from
 * `migrations/<name>/index.ts`; others are a module (`<path>.ts`) or a folder (`<path>/index.ts`).
 */
export function factorySources(repository: Repository, factory: string): string[] {
  const path = factory.replace(/^\.\//, '').replace(/#.*$/, '');
  const bundled = /^bundles\/(.+?)(?:\.c?js)?$/.exec(path);
  const module = bundled ? `migrations/${bundled[1]}/index` : path.replace(/\/bundle$/, '/index');
  const root = COLLECTIONS[repository].root;
  return [`${root}/${module}.ts`, `${root}/${module}/index.ts`];
}

/** Every migration of the snapshots, by name then repository; versions oldest first. */
export function collectMigrations(snapshots: MigrationsSnapshot[]): CollectedMigration[] {
  const ordered = [...snapshots].sort((a, b) => compareVersions(a.version, b.version));
  const byKey = new Map<string, CollectedMigration>();
  for (const snapshot of ordered) {
    for (const [key, entry] of Object.entries(snapshot.schematics)) {
      const version = migrationVersion(entry.version);
      if (!version) continue;
      const name = migrationName(key);
      const id = `${snapshot.repository} ${name}`;
      const migration =
        byKey.get(id) ??
        ({
          name,
          repository: snapshot.repository,
          description: '',
          factory: null,
          firstRef: snapshot.ref,
          versions: [],
        } satisfies CollectedMigration);
      byKey.set(id, migration);
      // The newest wording wins, the first factory stays (it goes with `firstRef`); the optional
      // flag is the newest seen for that version.
      if (entry.description) migration.description = entry.description.trim();
      migration.factory ??= entry.factory ?? null;
      const optional = entry.optional === true;
      const existing = migration.versions.find((v) => v.version === version);
      if (existing) existing.optional = optional;
      else migration.versions.push({ version, optional });
    }
  }
  const byVersion = (a: { version: string }, b: { version: string }) =>
    compareVersions(parseVersion(a.version)!, parseVersion(b.version)!);
  return [...byKey.values()]
    .map((migration) => ({ ...migration, versions: migration.versions.sort(byVersion) }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.repository.localeCompare(b.repository));
}
