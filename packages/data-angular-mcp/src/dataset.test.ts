import { describe, expect, it } from 'vitest';

import { mcpFeatures } from './index';

const STATUSES = new Set(['experimental', 'preview', 'stable', 'deprecated', 'removed']);

/** Guards for data PRs: a broken entry fails CI before it reaches the site. */
describe('Angular MCP server catalog', () => {
  it('has unique ids and names, a kind, and a description', () => {
    const ids = mcpFeatures.map((feature) => feature.id);
    const names = mcpFeatures.map((feature) => feature.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
    for (const feature of mcpFeatures) {
      expect(feature.id, feature.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(['tool', 'resource'], feature.id).toContain(feature.type);
      expect(feature.description.trim().length, feature.id).toBeGreaterThan(10);
    }
  });

  it('only uses known statuses, in ascending versions', () => {
    for (const feature of mcpFeatures) {
      expect(feature.versions.length, feature.id).toBeGreaterThan(0);
      let previous = 0;
      for (const entry of feature.versions) {
        expect(STATUSES.has(entry.status), `${feature.id} v${entry.version}`).toBe(true);
        expect(entry.version, `${feature.id}: versions must be ascending`).toBeGreaterThan(
          previous,
        );
        previous = entry.version;
      }
    }
  });
});
