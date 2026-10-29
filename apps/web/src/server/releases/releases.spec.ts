import { describe, expect, it } from 'vitest';

import { featureRows } from '../caniuse';
import { textParts } from './guide';
import { handleReleases } from './handle';
import {
  listAllCommits,
  listChangelogs,
  listCommits,
  listFeatureChanges,
  listGuides,
  listMcpAdditions,
  RELEASE_MAJORS,
  releaseSummary,
} from './index';
import { compareVersionsDesc } from './versions';

describe('release insights API', () => {
  it('lists majors newest first and answers null for unknown ones', async () => {
    expect(RELEASE_MAJORS[0]).toBeGreaterThan(RELEASE_MAJORS.at(-1)!);
    expect(await handleReleases('/13', new URLSearchParams())).toBeNull();
    expect(await handleReleases('/22/nope', new URLSearchParams())).toBeNull();
  });

  it('summarises a major with a count per section', async () => {
    const summary = await releaseSummary(22);
    expect(summary?.sections.map((s) => s.id)).toEqual([
      'overview',
      'features',
      'update',
      'commits',
      'mcp',
      'eslint',
      'changelogs',
    ]);
    expect(summary?.sections.find((s) => s.id === 'commits')?.count).toBeGreaterThan(0);
  });

  it('lists only tracked Can I Use features and filters by status', async () => {
    const ids = new Set(featureRows().map((row) => row.id));
    for (const major of RELEASE_MAJORS) {
      for (const row of (await listFeatureChanges(major)).items) {
        expect(ids.has(row.id), `${major} ${row.id}`).toBe(true);
      }
    }
    const stable = await listFeatureChanges(22, 'stable');
    expect(stable.items.every((row) => row.current?.status === 'stable')).toBe(true);
  });

  it('pages and filters commits, with facets over the whole major', () => {
    const page = listCommits(22, { type: 'feat' });
    expect(page.items.every((c) => c.type === 'feat')).toBe(true);
    expect(page.items.length).toBeLessThanOrEqual(50);
    expect(page.types[0]?.count).toBe(listCommits(22).total);
  });

  it('searches the commits of every release, newest first, narrowed by major', async () => {
    const all = listAllCommits();
    expect(all.versions[0]).toMatchObject({ value: '', count: all.total });
    // Each major comes first, then its releases; the majors add up to the total.
    const majors = all.versions.filter((v) => v.major);
    expect(majors.map((m) => Number(m.value))).toEqual(
      majors.map((m) => Number(m.value)).sort((a, b) => b - a),
    );
    expect(majors.reduce((sum, m) => sum + (m.count ?? 0), 0)).toBe(all.total);
    const at22 = all.versions.findIndex((v) => v.value === '22');
    expect(all.versions[at22 + 1]?.value).toMatch(/^22\.\d+\.\d+$/);
    const versions = all.items.map((c) => c.version);
    expect(versions).toEqual([...versions].sort(compareVersionsDesc));

    const release = listAllCommits({ version: '20.1.0' });
    expect(release.total).toBe(all.versions.find((v) => v.value === '20.1.0')?.count);
    expect(release.items.every((c) => c.version === '20.1.0')).toBe(true);

    const older = listAllCommits({ version: '20', search: 'signal' });
    expect(older.total).toBeGreaterThan(0);
    expect(older.items.every((c) => c.version.startsWith('20.'))).toBe(true);
    // The search matches the release number too.
    expect(listAllCommits({ search: '20.1.0' }).items.every((c) => c.version === '20.1.0')).toBe(
      true,
    );

    const viaApi = (await handleReleases('/commits', new URLSearchParams('type=perf'))) as {
      items: { type: string }[];
    };
    expect(viaApi.items.every((c) => c.type === 'perf')).toBe(true);
    expect(await handleReleases('/commits', new URLSearchParams('version=abc'))).toBeNull();
    expect(await handleReleases('/commits', new URLSearchParams('version=22.1'))).toBeNull();
    expect(await handleReleases('/commits/more', new URLSearchParams())).toBeNull();
  });

  it('defaults changelogs to stable releases', () => {
    const list = listChangelogs(22);
    expect(list.items.every((row) => row.channel === 'stable')).toBe(true);
    expect(listChangelogs(22, { channel: 'all' }).items.length).toBeGreaterThan(list.items.length);
  });

  it('filters the migration guide by criticality, difficulty and impact, keeping the totals', () => {
    const all = listGuides(22);
    expect(all.guides.length).toBeGreaterThan(0);
    const total = all.guides.reduce((sum, guide) => sum + guide.changes.length, 0);
    expect(total).toBe(all.guides.reduce((sum, guide) => sum + guide.total, 0));
    expect(all.criticalities.map((level) => level.value)).toEqual([
      'critical',
      'high',
      'medium',
      'low',
    ]);
    expect(all.criticalities.reduce((sum, level) => sum + (level.count ?? 0), 0)).toBe(total);
    // Only the values in use are offered, after an "any" option.
    expect(all.difficulties[0]).toEqual({ value: '', label: 'Any difficulty' });
    expect(all.impacts.length).toBeGreaterThan(1);

    const high = listGuides(22, { criticality: 'high' });
    const highChanges = high.guides.flatMap((guide) => guide.changes);
    expect(highChanges.length).toBe(all.criticalities.find((l) => l.value === 'high')!.count);
    expect(highChanges.every((change) => change.criticality === 'high')).toBe(true);
    expect(high.guides[0]!.total).toBe(all.guides[0]!.total);

    const narrow = listGuides(22, { difficulty: 'trivial', impact: 'security' });
    const narrowChanges = narrow.guides.flatMap((guide) => guide.changes);
    expect(narrowChanges.length).toBeLessThan(total);
    expect(narrowChanges.every((c) => c.difficultyLabel === 'Trivial' && c.impactLabel)).toBe(true);

    // Changes come most critical first.
    const order = ['critical', 'high', 'medium', 'low'];
    for (const guide of all.guides) {
      const ranks = guide.changes.map((change) => order.indexOf(change.criticality));
      expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    }
    expect(listGuides(17).guides).toEqual([]);
  });

  it('explains an empty MCP list before Angular 20', () => {
    expect(listMcpAdditions(17).unavailableNote).not.toBeNull();
    expect(listMcpAdditions(21).items.length).toBeGreaterThan(0);
  });

  it('orders versions newest first and splits inline code', () => {
    expect(['22.0.0', '22.1.0-rc.1', '22.1.0', '22.0.10'].sort(compareVersionsDesc)).toEqual([
      '22.1.0',
      '22.1.0-rc.1',
      '22.0.10',
      '22.0.0',
    ]);
    expect(textParts('Run `ng update` now')).toEqual([
      { text: 'Run ', code: false },
      { text: 'ng update', code: true },
      { text: ' now', code: false },
    ]);
  });
});
