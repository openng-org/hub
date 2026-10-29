import { getFeaturesWithStageChanges, type FeatureStatusChange } from '@openng/data-caniuse';
import { ANGULAR_MAJORS_DESC } from '@openng/core-angular-versions';

import type { StatusBadge, StatusKey } from '../../app/features/caniuse/caniuse.model';
import type {
  FilterOption,
  ReleaseFeatureRow,
  ReleaseFeatures,
} from '../../app/features/releases/releases.model';
import { featureId } from '../caniuse/features';
import { isStatusKey, versionLabel } from '../caniuse/matrix';
import { memo } from '../memo';

const STATUS_ORDER: StatusKey[] = ['stable', 'preview', 'experimental', 'deprecated', 'removed'];

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function badge(entry: FeatureStatusChange['currentStatus']): StatusBadge | null {
  return entry && isStatusKey(entry.status)
    ? { status: entry.status, version: versionLabel(entry.version) }
    : null;
}

function toRow(change: FeatureStatusChange): ReleaseFeatureRow {
  const previous = badge(change.previousStatus);
  const current: StatusBadge | null =
    change.changeType === 'removed'
      ? { status: 'removed', version: '' }
      : badge(change.currentStatus);
  const changeLabel =
    change.changeType === 'new'
      ? 'New'
      : change.changeType === 'removed'
        ? 'Removed'
        : `${capitalize(previous?.status ?? '')} → ${capitalize(current?.status ?? '')}`;
  return {
    id: featureId(change.feature),
    name: change.feature.name,
    package: change.feature.package ?? null,
    previous,
    current,
    change: change.changeType,
    changeLabel,
  };
}

/** A real stage change: new, removed, or a different status than at the end of the last major. */
function isChange(change: FeatureStatusChange): boolean {
  if (change.changeType !== 'status-change') return true;
  return (
    !!change.currentStatus?.status &&
    !!change.previousStatus?.status &&
    change.currentStatus.status !== change.previousStatus.status
  );
}

const rank = (row: ReleaseFeatureRow) =>
  row.current ? STATUS_ORDER.indexOf(row.current.status) : STATUS_ORDER.length;

/** Features whose stage changed in `major`, by status reached (stable first), then name. */
const changesOf = memo((major: number): ReleaseFeatureRow[] =>
  getFeaturesWithStageChanges(major, ANGULAR_MAJORS_DESC)
    .filter(isChange)
    .map(toRow)
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)),
);

export function countFeatureChanges(major: number): number {
  return changesOf(major).length;
}

export function listFeatureChanges(major: number, status = ''): ReleaseFeatures {
  const rows = changesOf(major);
  const counts = new Map<StatusKey, number>();
  for (const row of rows) {
    if (row.current) counts.set(row.current.status, (counts.get(row.current.status) ?? 0) + 1);
  }
  const statuses: FilterOption[] = [
    { value: '', label: 'All', count: rows.length },
    ...STATUS_ORDER.filter((key) => counts.has(key)).map((key) => ({
      value: key,
      label: capitalize(key),
      count: counts.get(key),
    })),
  ];
  const items = status ? rows.filter((row) => row.current?.status === status) : rows;
  return {
    major,
    previousMajor: ANGULAR_MAJORS_DESC.find((m) => m < major) ?? null,
    items,
    total: items.length,
    statuses,
  };
}
