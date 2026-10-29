/**
 * How much work it takes to apply a change.
 * - trivial: nothing to do, or a one-line change
 * - easy: a few mechanical edits, usually search & replace
 * - moderate: needs some understanding of the codebase / coordination
 * - hard: architectural work, backend changes or wide refactors
 */
export type MigrationDifficulty = 'trivial' | 'easy' | 'moderate' | 'hard';

/**
 * How urgent / risky it is to ignore a change.
 * - low: optional, nice to have
 * - medium: should be planned (deprecation, subtle behavior change)
 * - high: can break an app or leave it exposed, handle during the update
 * - critical: blocks the update or is an actively exploitable issue
 */
export type MigrationCriticality = 'low' | 'medium' | 'high' | 'critical';

/** Area of the application impacted by a change. */
export type MigrationImpact =
  'security' | 'devx' | 'performance' | 'reliability' | 'build' | 'ssr' | 'maintenance';

/** Nature of the change. */
export type MigrationChangeKind =
  'breaking' | 'behavior-change' | 'deprecation' | 'security-fix' | 'new-feature';

export type MigrationCodeSample = {
  language: string;
  code: string;
};

export type MigrationLink = {
  label: string;
  url: string;
};

export type MigrationChange = {
  id: string;
  title: string;
  /** One or two sentences explaining what changed and why it matters. */
  summary: string;
  kind: MigrationChangeKind;
  difficulty: MigrationDifficulty;
  criticality: MigrationCriticality;
  impact: MigrationImpact;
  /** First version shipping the change (e.g. "22.1.0", "22.1.3"). */
  introducedIn: string;
  packages: string[];
  /** Who needs to care about this change. */
  affects: string;
  /** Ordered migration steps. Inline `code` is supported. */
  steps: string[];
  /** Optional CLI command automating (part of) the migration. */
  command?: string;
  before?: MigrationCodeSample;
  after?: MigrationCodeSample;
  links?: MigrationLink[];
};

export type MigrationGuide = {
  /** Minor version targeted by the guide (e.g. "22.1"). */
  version: string;
  majorVersion: number;
  /** ISO date of the x.y.0 release. */
  releaseDate: string;
  /** Version the guide migrates from (e.g. "22.0"). */
  from: string;
  summary: string;
  /** Command to run before going through the changes. */
  updateCommand: string;
  changes: MigrationChange[];
};

export const MIGRATION_DIFFICULTY_ORDER: MigrationDifficulty[] = [
  'trivial',
  'easy',
  'moderate',
  'hard',
];

export const MIGRATION_CRITICALITY_ORDER: MigrationCriticality[] = [
  'critical',
  'high',
  'medium',
  'low',
];
