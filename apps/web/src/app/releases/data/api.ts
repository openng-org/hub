/**
 * The Release Insights API contract: what one Angular major brought, section by section, shaped
 * for the UI as it renders it. Types only; built in apps/web/src/server/releases/.
 */
import type { EslintRow, MigrationRef, StatusBadge, StatusKey } from '../../caniuse/data/api';

export type { StatusBadge, StatusKey };

export type ReleaseSectionId =
  'overview' | 'features' | 'guide' | 'update' | 'commits' | 'mcp' | 'eslint' | 'changelogs';

export interface ReleaseSection {
  id: ReleaseSectionId;
  label: string;
  /** `pi pi-*` icon class. */
  icon: string;
  /** One line on what the section lists. */
  description: string;
  /** How many items the section lists for this major; null for the overview. */
  count: number | null;
  /** Route segments under /releases/<major>. */
  path: string[];
}

export interface ReleaseLink {
  label: string;
  icon: string;
  url: string;
}

/** Everything the release layout and the overview show. */
export interface ReleaseSummary {
  major: number;
  /** Every major with insights, newest first (the version chips). */
  majors: number[];
  /** "Released 20 May 2026", from the x.0.0 GitHub release. */
  released: string | null;
  /** Newest stable release of the major ("22.2.0"). */
  latestVersion: string | null;
  youtubeVideoId: string | null;
  /** Announcement, update guide, documentation. */
  resources: ReleaseLink[];
  sections: ReleaseSection[];
  /** schema.org TechArticle for the release pages. */
  jsonLd: object;
}

export interface ReleaseIndex {
  majors: number[];
  latest: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// --- Features -----------------------------------------------------------------------------------

export type FeatureChange = 'new' | 'status-change' | 'removed';

export interface ReleaseFeatureRow {
  /** Can I Use feature id: /caniuse/<id>. */
  id: string;
  name: string;
  package: string | null;
  /** Status at the end of the previous major. */
  previous: StatusBadge | null;
  /** Status at the end of this major. */
  current: StatusBadge | null;
  change: FeatureChange;
  /** "New", "Experimental → Stable", "Removed". */
  changeLabel: string;
}

export interface ReleaseFeatures {
  major: number;
  previousMajor: number | null;
  items: ReleaseFeatureRow[];
  /** Rows matching the status filter. */
  total: number;
  /** Status chips: "All" plus every status reached in this major, with counts. */
  statuses: FilterOption[];
}

// --- Migration guide ----------------------------------------------------------------------------

export type GuideCriticality = 'critical' | 'high' | 'medium' | 'low';

/** A run of text, rendered as inline code when `code` is set. */
export interface TextPart {
  text: string;
  code: boolean;
}

export interface GuideChange {
  id: string;
  title: string;
  summary: TextPart[];
  criticality: GuideCriticality;
  criticalityLabel: string;
  /** 1 (trivial) to 4 (hard), for the meter. */
  difficultyLevel: number;
  difficultyLabel: string;
  impactLabel: string;
  impactIcon: string;
  kindLabel: string;
  breaking: boolean;
  introducedIn: string;
  packages: string[];
  affects: string;
  steps: TextPart[][];
  command: string | null;
  before: string | null;
  after: string | null;
  links: { label: string; url: string }[];
}

export interface Guide {
  /** "22.1" */
  version: string;
  from: string;
  /** "Released 29 Jul 2026" */
  released: string;
  summary: string;
  updateCommand: string;
  hasBreaking: boolean;
  /** Changes matching the filters, most critical first. */
  changes: GuideChange[];
  /** Changes in the guide, whatever the filters. */
  total: number;
}

export interface GuideQuery {
  criticality?: string;
  difficulty?: string;
  impact?: string;
}

export interface ReleaseGuides {
  major: number;
  /** Newest minor first. */
  guides: Guide[];
  /** Changes per criticality across the major's guides, most critical first. */
  criticalities: FilterOption[];
  difficulties: FilterOption[];
  impacts: FilterOption[];
}

// --- NG Update ----------------------------------------------------------------------------------

export interface ReleaseUpdateRow extends MigrationRef {
  /** "22.0.0" */
  version: string;
}

export interface ReleaseUpdate {
  major: number;
  items: ReleaseUpdateRow[];
  /** /caniuse/update/<major>, with every example diff; null when the major has none. */
  detailsPath: string[] | null;
}

// --- Commits ------------------------------------------------------------------------------------

export interface CommitRow {
  sha: string;
  /** Seven characters. */
  shortSha: string;
  url: string;
  /** The commit subject, with its `code` runs split out. */
  description: TextPart[];
  version: string;
  type: string;
  package: string;
  repository: string;
}

export interface CommitQuery {
  search?: string;
  type?: string;
  package?: string;
  version?: string;
  page?: number;
}

export interface ReleaseCommits {
  major: number;
  items: CommitRow[];
  /** Commits matching the filters, across all pages. */
  total: number;
  page: number;
  pageCount: number;
  types: FilterOption[];
  packages: FilterOption[];
  /** Stable releases of the major, newest first. */
  versions: FilterOption[];
}

// --- MCP and ESLint -----------------------------------------------------------------------------

export interface ReleaseMcpRow {
  id: string;
  name: string;
  /** "Tool" or "Resource". */
  typeLabel: string;
  description: string;
  /** Status when it arrived in this major. */
  status: StatusBadge;
}

export interface ReleaseMcp {
  major: number;
  items: ReleaseMcpRow[];
  /** The MCP server shipped in Angular 20: set for older majors, explaining why the list is empty. */
  unavailableNote: string | null;
}

export interface ReleaseEslint {
  major: number;
  items: EslintRow[];
}

// --- Changelogs ---------------------------------------------------------------------------------

export type ReleaseChannel = 'stable' | 'rc' | 'next';

export interface ChangelogRow {
  version: string;
  channel: ReleaseChannel;
  channelLabel: string;
  /** "12 Nov 2025" */
  date: string;
  links: { repository: string; url: string }[];
}

export interface ChangelogQuery {
  /** Defaults to stable; "all" lists every channel. */
  channel?: string;
}

export interface ReleaseChangelogs {
  major: number;
  items: ChangelogRow[];
  channels: FilterOption[];
}
