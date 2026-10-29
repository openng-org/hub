import { getAllMigrations } from '@openng/data-caniuse';
import { mcpFeatures } from '@openng/data-caniuse/mcp';
import { compareSemver, majorOf } from '@openng/core-angular-versions';

import type {
  ReleaseEslint,
  ReleaseMcp,
  ReleaseMcpRow,
  ReleaseUpdate,
  ReleaseUpdateRow,
} from '../../app/features/releases/releases.model';
import { MCP_FIRST_MAJOR } from '../caniuse/majors';
import { isStatusKey, versionLabel } from '../caniuse/matrix';
import { listEslint } from '../caniuse/mcp-eslint';
import { toRef } from '../caniuse/migrations';

/** ng update migrations shipped in a major, in release order. */
export function listUpdate(major: number): ReleaseUpdate {
  const items = getAllMigrations()
    .flatMap((migration): ReleaseUpdateRow[] => {
      const version = migration.versions.find((v) => majorOf(v.version) === major)?.version;
      return version ? [{ ...toRef(migration), version }] : [];
    })
    .sort((a, b) => compareSemver(a.version, b.version) || a.name.localeCompare(b.name));
  return {
    major,
    items,
    detailsPath: items.length > 0 ? ['/caniuse', 'update', String(major)] : null,
  };
}

/** MCP server tools and resources that first appeared in a major. */
export function listMcpAdditions(major: number): ReleaseMcp {
  const items = mcpFeatures.flatMap((feature): ReleaseMcpRow[] => {
    const first = [...feature.versions].sort((a, b) => a.version - b.version)[0];
    if (!first || Math.floor(first.version) !== major || !isStatusKey(first.status)) return [];
    return [
      {
        id: feature.id,
        name: feature.name,
        typeLabel: feature.type === 'tool' ? 'Tool' : 'Resource',
        description: feature.description,
        status: { status: first.status, version: versionLabel(first.version) },
      },
    ];
  });
  return {
    major,
    items,
    unavailableNote:
      major < MCP_FIRST_MAJOR
        ? `The Angular MCP server shipped with Angular ${MCP_FIRST_MAJOR}: nothing to list for Angular ${major}.`
        : null,
  };
}

/** angular-eslint rules released for a major. */
export function listEslintAdditions(major: number): ReleaseEslint {
  return {
    major,
    items: listEslint()
      .items.filter((rule) => majorOf(rule.version) === major)
      .sort((a, b) => compareSemver(a.version, b.version) || a.name.localeCompare(b.name)),
  };
}
