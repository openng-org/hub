/**
 * How statuses look: icons, colors, tag severities and the legend/tooltip copy. Pure presentation;
 * which status applies where comes from the API.
 */
import type { StatusKey } from '../caniuse/data/api';

export type DisplayStatus = StatusKey | 'upcoming';

/** OpenNG icon class per status (the `pi pi-*` font shipped with Optimus UI). */
export const STATUS_ICONS: Record<DisplayStatus, string> = {
  experimental: 'pi pi-flask', // drawn in styles/base.css (not in @openng/icons)
  preview: 'pi pi-eye',
  stable: 'pi pi-check-circle',
  deprecated: 'pi pi-times-circle',
  removed: 'pi pi-trash',
  upcoming: 'pi pi-clock',
};

/** Tailwind classes per status, built on the status palette declared in styles.css (`@theme`). */
export interface StatusPalette {
  text: string;
  bg: string;
  border: string;
}

export const STATUS_COLORS: Record<DisplayStatus, StatusPalette> = {
  experimental: {
    text: 'text-status-experimental',
    bg: 'bg-status-experimental/15',
    border: 'border-status-experimental/40',
  },
  preview: {
    text: 'text-status-preview',
    bg: 'bg-status-preview/15',
    border: 'border-status-preview/40',
  },
  stable: {
    text: 'text-status-stable',
    bg: 'bg-status-stable/15',
    border: 'border-status-stable/40',
  },
  deprecated: {
    text: 'text-status-deprecated',
    bg: 'bg-status-deprecated/15',
    border: 'border-status-deprecated/40',
  },
  removed: {
    text: 'text-status-removed',
    bg: 'bg-status-removed/15',
    border: 'border-status-removed/40',
  },
  upcoming: {
    text: 'text-status-upcoming',
    bg: 'bg-status-upcoming/15',
    border: 'border-status-upcoming/40',
  },
};

export const STATUS_TITLES: Record<StatusKey, string> = {
  experimental: 'Experimental',
  preview: 'Developer Preview',
  stable: 'Stable',
  deprecated: 'Deprecated',
  removed: 'Removed',
};

const STATUS_DESCRIPTIONS: Record<StatusKey, string> = {
  experimental: 'Experimental feature - may change or be removed',
  preview: 'Preview feature - stable API but may have breaking changes',
  stable: 'Stable feature - production ready',
  deprecated: 'Deprecated feature - will be removed in future version',
  removed: 'Removed feature - no longer available',
};

/** Optimus Tag severity per status. */
export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export const STATUS_SEVERITY: Record<StatusKey, TagSeverity> = {
  stable: 'success',
  preview: 'info',
  experimental: 'warn',
  deprecated: 'danger',
  removed: 'danger',
};

export interface StatusLegendItem {
  type: DisplayStatus;
  label: string;
  description: string;
}

/** Legend of the Features tab. */
export const CANIUSE_STATUS_LEGEND_ITEMS: readonly StatusLegendItem[] = [
  {
    type: 'experimental',
    label: 'Experimental',
    description: 'Might not become stable at all or have significant changes',
  },
  {
    type: 'preview',
    label: 'Developer Preview',
    description: 'Fully functional but not ready to stabilize',
  },
  { type: 'stable', label: 'Stable', description: 'Production ready with full support' },
  { type: 'deprecated', label: 'Deprecated', description: 'Obsolete API, should be replaced' },
  { type: 'removed', label: 'Removed', description: 'Feature has been completely removed' },
];

/** Legend of the MCP tab: the catalog only tracks these two stages. */
export const MCP_STATUS_LEGEND_ITEMS: readonly StatusLegendItem[] = [
  CANIUSE_STATUS_LEGEND_ITEMS[0]!,
  CANIUSE_STATUS_LEGEND_ITEMS[2]!,
];

/** Options of the status filter. */
export const STATUS_FILTER_OPTIONS: readonly { value: StatusKey; label: string; icon: string }[] = (
  Object.keys(STATUS_TITLES) as StatusKey[]
).map((value) => ({
  value,
  label: STATUS_TITLES[value],
  icon: STATUS_ICONS[value],
}));

/** Text safe to put in HTML (the tooltips are built from data attributes). */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!,
  );
}

const isStatusKey = (value: string | null): value is StatusKey =>
  value !== null && value in STATUS_TITLES;

/** Tooltip HTML for a matrix glyph, from the data attributes the delegated tooltip reads. */
export function statusTooltip(kind: string, status: string | null, version: string | null): string {
  const versionLine = `<span class="text-xs opacity-80">Version ${escapeHtml(version ?? '')}</span>`;
  switch (kind) {
    case 'status':
      return isStatusKey(status)
        ? `<strong>${STATUS_TITLES[status]}</strong> — ${STATUS_DESCRIPTIONS[status]}<br>${versionLine}`
        : '';
    case 'upcoming':
      return `<strong>Awaiting evolution</strong> — available in the current version, awaiting to see how it evolves in the next one<br><span class="text-xs opacity-80">May be promoted or remain in its current stage</span>`;
    case 'none':
      return `<strong>Not available</strong> — feature not available in this version<br>${versionLine}`;
    default:
      return '';
  }
}
