import { describe, expect, it } from 'vitest';

import { handleCaniuse } from './handle';
import {
  featureDetail,
  listEslint,
  listFeatures,
  listMcp,
  migrationTree,
  migrationsForMajor,
  summary,
  tabCounts,
} from './index';
import { FEATURE_PAGE_SIZE } from './features';

describe('features', () => {
  it('pages the full list and keeps every row ready to render', async () => {
    const first = await listFeatures();
    expect(first.items).toHaveLength(FEATURE_PAGE_SIZE);
    expect(first.pageCount).toBe(Math.ceil(first.total / FEATURE_PAGE_SIZE));
    for (const row of first.items) expect(row.cells).toHaveLength(first.majors.length);
    const last = await listFeatures({ page: first.pageCount });
    expect(last.items.length).toBeGreaterThan(0);
    expect(last.items.length).toBeLessThanOrEqual(FEATURE_PAGE_SIZE);
  });

  it('filters by search, package and latest status on the server', async () => {
    const search = await listFeatures({ search: 'SIGNAL' });
    expect(search.total).toBeGreaterThan(0);
    for (const row of search.items) expect(row.name.toLowerCase()).toContain('signal');

    const pkg = await listFeatures({ package: '@angular/router' });
    for (const row of pkg.items) expect(row.package).toBe('@angular/router');

    const stable = await listFeatures({ status: 'stable' });
    for (const row of stable.items) expect(row.latest?.status).toBe('stable');
  });

  it('resolves a detail with history newest first and a navigable replacement', async () => {
    const detail = await featureDetail('resource');
    expect(detail?.name).toBe('resource()');
    const versions = detail!.history.map((entry) => parseFloat(entry.version));
    expect(versions).toEqual([...versions].sort((a, b) => b - a));

    const replaced = (await listFeatures({ status: 'deprecated' })).items;
    for (const row of replaced) {
      const replacement = (await featureDetail(row.id))?.replacement;
      if (replacement?.id) expect(await featureDetail(replacement.id)).not.toBeNull();
    }
    expect(await featureDetail('no-such-feature')).toBeNull();
  });
});

describe('migrations', () => {
  it('nests version (newest first) → angular, angular-cli → migrations by name', () => {
    const { nodes, total } = migrationTree();
    expect(total).toBeGreaterThan(0);
    expect(nodes[0]!.expanded).toBe(true);
    expect(nodes.slice(1).every((node) => !node.expanded)).toBe(true);
    for (const version of nodes) {
      const repos = version.children!.map((c) => c.data.kind === 'repository' && c.data.repository);
      expect(repos).toEqual([...repos].sort());
      for (const repo of version.children!) {
        const names = repo.children!.map((m) =>
          m.data.kind === 'migration' ? m.data.migration.name : '',
        );
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
      }
    }
  });

  it('opens every version when a search narrows the tree', () => {
    const { nodes, total } = migrationTree('control-flow');
    expect(total).toBeGreaterThan(0);
    expect(nodes.every((node) => node.expanded)).toBe(true);
  });

  it('serves the migrations of a major with ready labels and diff rows', () => {
    const { migrations, majors } = migrationsForMajor(17);
    expect(majors[0]).toBeGreaterThanOrEqual(17);
    expect(migrations.length).toBeGreaterThan(0);
    for (const migration of migrations) {
      expect(migration.path).toEqual([
        '/caniuse',
        'update',
        'migrations',
        migration.repository,
        migration.name,
      ]);
    }
  });
});

describe('tabs and routing', () => {
  it('counts matches per tab and agrees with the lists', async () => {
    const counts = await tabCounts('signal');
    expect(counts.features).toBe((await listFeatures({ search: 'signal' })).total);
    expect(counts.migrations).toBe(migrationTree('signal').total);
    expect(counts.mcp).toBe(listMcp('signal').total);
    expect(counts.eslint).toBe(listEslint({ search: 'signal' }).total);
    expect((await summary()).counts).toEqual(await tabCounts());
  });

  it('filters ESLint rules by type', () => {
    const html = listEslint({ type: 'html' });
    expect(html.total).toBeGreaterThan(0);
    expect(html.items.every((rule) => rule.typeLabel === 'HTML')).toBe(true);
    expect(html.total + listEslint({ type: 'typescript' }).total).toBe(listEslint().total);
  });

  it('routes paths and query strings, and answers null for unknown ones', async () => {
    const list = (await handleCaniuse(
      '/features',
      new URLSearchParams('status=stable&page=2'),
    )) as {
      page: number;
    };
    expect(list.page).toBe(2);
    expect(await handleCaniuse('/features/resource', new URLSearchParams())).not.toBeNull();
    expect(await handleCaniuse('/migrations/major/3', new URLSearchParams())).toBeNull();
    expect(await handleCaniuse('/nope', new URLSearchParams())).toBeNull();
  });
});
