import {
  MIGRATION_CRITICALITY_ORDER,
  MIGRATION_DIFFICULTY_ORDER,
  migrationGuides,
  type MigrationChange,
  type MigrationChangeKind,
  type MigrationDifficulty,
  type MigrationGuide,
  type MigrationImpact,
} from '@openng/data-releases';

import type {
  FilterOption,
  Guide,
  GuideChange,
  GuideCriticality,
  GuideQuery,
  ReleaseGuides,
  TextPart,
} from '../../app/releases/data/api';
import { longDate } from '../community/dates';
import { compareSemver } from '@openng/core-angular-versions';

const CRITICALITY_LABELS: Record<GuideCriticality, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const DIFFICULTIES: Record<MigrationDifficulty, { label: string; level: number }> = {
  trivial: { label: 'Trivial', level: 1 },
  easy: { label: 'Easy', level: 2 },
  moderate: { label: 'Moderate', level: 3 },
  hard: { label: 'Hard', level: 4 },
};

const IMPACTS: Record<MigrationImpact, { label: string; icon: string }> = {
  security: { label: 'Security', icon: 'pi pi-shield' },
  devx: { label: 'DevX', icon: 'pi pi-sparkles' },
  performance: { label: 'Performance', icon: 'pi pi-gauge' },
  reliability: { label: 'Reliability', icon: 'pi pi-check-circle' },
  build: { label: 'Build', icon: 'pi pi-hammer' },
  ssr: { label: 'SSR', icon: 'pi pi-server' },
  maintenance: { label: 'Maintenance', icon: 'pi pi-wrench' },
};

const KINDS: Record<MigrationChangeKind, string> = {
  breaking: 'Breaking change',
  'behavior-change': 'Behavior change',
  deprecation: 'Deprecation',
  'security-fix': 'Security fix',
  'new-feature': 'New feature',
};

/** "Run `ng update`" → text, code, text. */
export function textParts(text: string): TextPart[] {
  return text
    .split(/(`[^`]+`)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 1
        ? { text: part.slice(1, -1), code: true }
        : { text: part, code: false },
    );
}

function toChange(change: MigrationChange): GuideChange {
  const difficulty = DIFFICULTIES[change.difficulty];
  const impact = IMPACTS[change.impact];
  return {
    id: change.id,
    title: change.title,
    summary: textParts(change.summary),
    criticality: change.criticality,
    criticalityLabel: CRITICALITY_LABELS[change.criticality],
    difficultyLevel: difficulty.level,
    difficultyLabel: difficulty.label,
    impactLabel: impact.label,
    impactIcon: impact.icon,
    kindLabel: KINDS[change.kind],
    breaking: change.kind === 'breaking',
    introducedIn: change.introducedIn,
    packages: change.packages,
    affects: change.affects,
    steps: change.steps.map(textParts),
    command: change.command ?? null,
    before: change.before?.code ?? null,
    after: change.after?.code ?? null,
    links: change.links ?? [],
  };
}

const byCriticality = (a: MigrationChange, b: MigrationChange) =>
  MIGRATION_CRITICALITY_ORDER.indexOf(a.criticality) -
  MIGRATION_CRITICALITY_ORDER.indexOf(b.criticality);

function guidesOf(major: number): MigrationGuide[] {
  return migrationGuides
    .filter((guide) => guide.majorVersion === major)
    .sort((a, b) => compareSemver(b.version, a.version));
}

export function countGuideChanges(major: number): number {
  return guidesOf(major).reduce((sum, guide) => sum + guide.changes.length, 0);
}

function toGuide(guide: MigrationGuide, query: GuideQuery): Guide {
  const changes = [...guide.changes]
    .sort(byCriticality)
    .filter(
      (change) =>
        (!query.criticality || change.criticality === query.criticality) &&
        (!query.difficulty || change.difficulty === query.difficulty) &&
        (!query.impact || change.impact === query.impact),
    );
  return {
    version: guide.version,
    from: guide.from,
    released: `Released ${longDate(guide.releaseDate)}`,
    summary: guide.summary,
    updateCommand: guide.updateCommand,
    hasBreaking: guide.changes.some((change) => change.kind === 'breaking'),
    changes: changes.map(toChange),
    total: guide.changes.length,
  };
}

export function listGuides(major: number, query: GuideQuery = {}): ReleaseGuides {
  const guides = guidesOf(major);
  const all = guides.flatMap((guide) => guide.changes);
  const options = <K extends string>(
    allLabel: string,
    keys: readonly K[],
    label: (key: K) => string,
    pick: (change: MigrationChange) => K,
  ): FilterOption[] => [
    { value: '', label: allLabel },
    ...keys
      .filter((key) => all.some((change) => pick(change) === key))
      .map((key) => ({ value: key, label: label(key) })),
  ];
  return {
    major,
    guides: guides.map((guide) => toGuide(guide, query)),
    criticalities: MIGRATION_CRITICALITY_ORDER.map((level) => ({
      value: level,
      label: CRITICALITY_LABELS[level],
      count: all.filter((change) => change.criticality === level).length,
    })),
    difficulties: options(
      'Any difficulty',
      MIGRATION_DIFFICULTY_ORDER,
      (key) => DIFFICULTIES[key].label,
      (c) => c.difficulty,
    ),
    impacts: options(
      'Any impact',
      Object.keys(IMPACTS) as MigrationImpact[],
      (key) => IMPACTS[key].label,
      (c) => c.impact,
    ),
  };
}
