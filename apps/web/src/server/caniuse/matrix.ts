import type { CellGlyph, MatrixCell, StatusBadge, StatusKey } from '../../app/caniuse/data/api';
import { LATEST_MAJOR_LABEL } from './majors';

/** A status recorded at a version: Can I Use features and MCP catalog entries both fit. */
export interface StatusAt {
  version: number;
  status: string | null;
}

const STATUS_KEYS: readonly StatusKey[] = [
  'experimental',
  'preview',
  'stable',
  'deprecated',
  'removed',
];

export function isStatusKey(value: unknown): value is StatusKey {
  return STATUS_KEYS.includes(value as StatusKey);
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** "22" for a major, "22.2" for a minor release. */
export function versionLabel(version: number): string {
  return Number.isInteger(version) ? String(version) : version.toFixed(1);
}

/** One cell per major: the statuses recorded within it (19, 19.1, 19.2 for "19"), oldest first. */
export function matrixCells(statuses: StatusAt[], majors: string[]): MatrixCell[] {
  return majors.map((major) => {
    const glyphs = statuses
      .filter((entry) => Math.floor(entry.version) === Number(major) && isStatusKey(entry.status))
      .sort((a, b) => a.version - b.version)
      .map((entry): CellGlyph => {
        const version = versionLabel(entry.version);
        return {
          status: entry.status as StatusKey,
          version,
          minor: !Number.isInteger(entry.version),
          label: `${capitalize(entry.status!)} in version ${version}`,
        };
      });
    if (glyphs.length > 0) return { major, kind: 'statuses', glyphs };
    return { major, kind: major === LATEST_MAJOR_LABEL ? 'upcoming' : 'none' };
  });
}

/** Newest known status, with the version it was recorded at. */
export function latestStatus(statuses: StatusAt[]): StatusBadge | null {
  let latest: StatusAt | null = null;
  for (const entry of statuses) {
    if (isStatusKey(entry.status) && (!latest || entry.version > latest.version)) latest = entry;
  }
  return latest
    ? { status: latest.status as StatusKey, version: versionLabel(latest.version) }
    : null;
}
