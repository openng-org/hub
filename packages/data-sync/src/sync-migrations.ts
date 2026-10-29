import { dirname } from 'node:path';

import type { GitHub } from './github.ts';
import {
  COLLECTIONS,
  collectMigrations,
  factorySources,
  type CollectedMigration,
  type MigrationsSnapshot,
  type Repository,
  type SchematicEntry,
} from './lib/migrations.ts';
import { mapLimit } from './lib/util.ts';
import { minorReleases } from './lib/versions.ts';
import { OUTPUTS, writeJson } from './output.ts';

const REPOSITORIES: Repository[] = ['angular', 'angular-cli'];

/**
 * data-caniuse: every ng update migration of angular/angular and angular/angular-cli
 * (angular-migrations.json), from the collection of the first release of every minor, with a link
 * to its sources at the first release that shipped it.
 */
export async function syncMigrations(github: GitHub): Promise<string[]> {
  const snapshots: MigrationsSnapshot[] = [];
  for (const repository of REPOSITORIES) {
    const releases = minorReleases(await github.tags(repository));
    const found = await mapLimit(releases, 8, async ({ tag, version }) => {
      const text = await github.raw(repository, tag, COLLECTIONS[repository].file);
      const schematics = text ? parseCollection(text) : null;
      return schematics ? { repository, ref: tag, version, schematics } : null;
    });
    snapshots.push(...found.filter((snapshot) => snapshot !== null));
  }

  const migrations = await mapLimit(collectMigrations(snapshots), 8, async (migration) => ({
    name: migration.name,
    repository: migration.repository,
    description: migration.description,
    sourceUrl: await sourceUrl(github, migration),
    versions: migration.versions,
  }));

  return [
    `angular-migrations.json: ${await writeJson(OUTPUTS.migrations, migrations)} (${migrations.length} migrations, ${snapshots.length} collections read)`,
  ];
}

/**
 * The migration's sources at the first release shipping it: its folder when it has one (index.ts,
 * migration.ts), the module otherwise; null when none of the likely places exists.
 */
async function sourceUrl(github: GitHub, migration: CollectedMigration): Promise<string | null> {
  const { repository, firstRef, factory } = migration;
  for (const path of factory ? factorySources(repository, factory) : []) {
    if ((await github.raw(repository, firstRef, path)) === null) continue;
    const folder = /\/(index|migration)\.ts$/.test(path);
    const base = `https://github.com/angular/${repository}`;
    return folder
      ? `${base}/tree/${firstRef}/${dirname(path)}`
      : `${base}/blob/${firstRef}/${path}`;
  }
  return null;
}

function parseCollection(text: string): Record<string, SchematicEntry> | null {
  try {
    return (JSON.parse(text) as { schematics?: Record<string, SchematicEntry> }).schematics ?? null;
  } catch {
    return null;
  }
}
