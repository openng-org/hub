/**
 * The Can I Use API contract: what the server sends, shaped for the UI as it renders it.
 *
 * Types only. The server builds these in apps/web/src/server/caniuse/ (Express routes and, during
 * SSR, direct calls); the UI only renders them. Anything computed from the datasets (statuses per
 * major, filtering, trees, diffs, labels, links) happens on the server.
 */

export type StatusKey = 'experimental' | 'preview' | 'stable' | 'deprecated' | 'removed';

/** One status glyph in a matrix cell: a major's status, or one introduced by a minor release. */
export interface CellGlyph {
  status: StatusKey;
  /** "22" for a major, "22.2" for a minor release. */
  version: string;
  minor: boolean;
  /** Accessible label, e.g. "Stable in version 22.2". */
  label: string;
}

/** What one matrix cell shows for one Angular major. */
export type MatrixCell =
  | { major: string; kind: 'none' }
  /** No status yet in the latest major: the feature is awaiting its next evolution. */
  | { major: string; kind: 'upcoming' }
  | { major: string; kind: 'statuses'; glyphs: CellGlyph[] };

export interface StatusBadge {
  status: StatusKey;
  version: string;
}

/** A row of the features matrix. */
export interface FeatureRow {
  id: string;
  name: string;
  package: string | null;
  description: string | null;
  /** Newest known status, for the title tag and the hover card. */
  latest: StatusBadge | null;
  /** One per major of `majors`, newest first. */
  cells: MatrixCell[];
}

export interface Page<T> {
  items: T[];
  /** Items matching the query, across all pages. */
  total: number;
  page: number;
  pageCount: number;
}

export interface FeatureList extends Page<FeatureRow> {
  /** Matrix column headers, newest first. */
  majors: string[];
}

export interface FeatureQuery {
  search?: string;
  package?: string;
  /** Matches the feature's latest status. */
  status?: string;
  /** 1-based. */
  page?: number;
}

export interface FeatureLink {
  label: string;
  /** `pi pi-*` icon class. */
  icon: string;
  url: string;
}

export interface FeatureHistoryEntry {
  version: string;
  status: StatusKey;
  notes: string | null;
}

/** Everything the drawer and the feature page show. */
export interface FeatureDetail extends FeatureRow {
  majors: string[];
  notes: string | null;
  migrationNotes: string | null;
  /** `command` to copy; `search` is the term the NG Update tab looks for. */
  migrationScript: { command: string; search: string } | null;
  links: FeatureLink[];
  /** `id` is null when the replacement is not a tracked feature (then only its name is shown). */
  replacement: { id: string | null; name: string } | null;
  /** Statuses, newest first. */
  history: FeatureHistoryEntry[];
  /** schema.org TechArticle for the feature page. */
  jsonLd: object;
}

export interface TabCounts {
  features: number;
  migrations: number;
  mcp: number;
  eslint: number;
}

export interface CaniuseSummary {
  /** Totals for the tab badges when no search is active. */
  counts: TabCounts;
  /** Options of the package filter. */
  packages: string[];
}

// --- NG Update ----------------------------------------------------------------------------------

export type MigrationRepository = 'angular' | 'angular-cli';

export interface MigrationRef {
  name: string;
  repository: MigrationRepository;
  description: string;
  /** Route segments of the detail page. */
  path: string[];
}

/** A row of the NG Update tree: a version, a repository within it, or a migration. */
export type MigrationTreeRow =
  | { kind: 'version'; key: string; version: string; major: number; count: number }
  | { kind: 'repository'; key: string; repository: MigrationRepository; count: number }
  | { kind: 'migration'; key: string; migration: MigrationRef; optional: boolean };

export interface MigrationTreeNode {
  key: string;
  data: MigrationTreeRow;
  children?: MigrationTreeNode[];
  expanded?: boolean;
  leaf?: boolean;
}

export interface MigrationTree {
  nodes: MigrationTreeNode[];
  /** Migrations matching the search. */
  total: number;
}

export interface DiffRow {
  before: { text: string; removed: boolean } | null;
  after: { text: string; added: boolean } | null;
}

export interface MigrationDetail extends MigrationRef {
  /** "19.0.0", or "Introduced 19.0.0" when the migration ships in several versions. */
  introduced: string | null;
  sourceUrl: string | null;
  example: { explanation: string | null; commitUrl: string | null; rows: DiffRow[] } | null;
}

export interface MigrationsForMajor {
  major: number;
  migrations: MigrationDetail[];
  /** Every major that has migrations, newest first (the version select). */
  majors: number[];
}

// --- MCP and ESLint -----------------------------------------------------------------------------

export interface McpRow {
  id: string;
  name: string;
  type: string;
  description: string;
  cells: MatrixCell[];
}

export interface McpList {
  items: McpRow[];
  total: number;
  majors: string[];
}

export type EslintRuleType = 'typescript' | 'html';

export interface EslintRow {
  name: string;
  description: string;
  type: EslintRuleType;
  typeLabel: string;
  version: string;
  url: string;
}

export interface EslintList {
  items: EslintRow[];
  total: number;
}

export interface EslintQuery {
  search?: string;
  type?: string;
}
