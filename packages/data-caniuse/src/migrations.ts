import angularMigrations from '../data/angular-migrations.json';

export type MigrationRepository = 'angular' | 'angular-cli';

export interface MigrationVersion {
  version: string;
  optional: boolean;
  sourceVersion: string;
}

/** One ng-update schematic with the versions it ships in. */
export interface Migration {
  name: string;
  description: string;
  /** Sorted list of versions where this migration exists, with optional flag per version. */
  versions: MigrationVersion[];
  /** Source repository: angular or angular-cli. */
  repository?: MigrationRepository;
  /** Relative path to the migration folder in the repo (for source link). */
  factory?: string;
}

const migrations = angularMigrations.migrations as Migration[];

/** Every tracked ng-update migration, as shipped in data/angular-migrations.json. */
export function getAllMigrations(): Migration[] {
  return migrations;
}

export function getOptionalMigrations(targetVersion: number): Migration[] {
  return migrations.filter((m) =>
    m.versions.some((v) => v.optional && v.version.startsWith(`${targetVersion}.`)),
  );
}

export function getMandatoryMigrations(targetVersion: number): Migration[] {
  return migrations.filter((m) =>
    m.versions.some((v) => !v.optional && v.version.startsWith(`${targetVersion}.`)),
  );
}

/** Migrations that ship in any release of a major (19.0, 19.1, ...). */
export function getMigrationsForMajor(major: number): Migration[] {
  const prefix = `${major}.`;
  return migrations.filter((m) => m.versions.some((v) => v.version.startsWith(prefix)));
}

/** Majors with at least one migration, newest first. */
export function getMigrationMajors(): number[] {
  const majors = new Set<number>();
  for (const migration of migrations) {
    for (const v of migration.versions) {
      const major = parseInt(v.version.split('.')[0] ?? '0', 10);
      if (major > 0) majors.add(major);
    }
  }
  return [...majors].sort((a, b) => b - a);
}

export function findMigration(repository: MigrationRepository, name: string): Migration | null {
  return (
    migrations.find((m) => (m.repository ?? 'angular') === repository && m.name === name) ?? null
  );
}
