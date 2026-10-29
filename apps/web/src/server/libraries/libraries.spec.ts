import { LATEST_MAJOR } from '@openng/core-angular-versions';
import { LIBRARY_MAJORS, libraryHealth } from '@openng/data-libraries';
import { describe, expect, it } from 'vitest';

import { handleLibraries } from './handle';
import { downloadsLabel, libraryDetail, libraryPath, libraryRefs, listLibraries } from './index';

describe('library health views', () => {
  it('lists every synced library, healthiest first, with facets over the search', () => {
    const list = listLibraries();
    expect(list.total).toBe(libraryHealth.length);
    expect(list.latestMajor).toBe(LATEST_MAJOR);
    const scores = list.items.map((item) => item.score.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(list.categories[0]).toMatchObject({ value: '', count: list.total });
    expect(list.majors.map((m) => m.value)).toEqual([
      '',
      ...[...LIBRARY_MAJORS].reverse().map(String),
    ]);
    for (const item of list.items) {
      expect(item.path[0]).toBe('/libraries');
      expect(item.majors.length).toBe(4);
      expect(item.majors[0]?.major).toBe(LATEST_MAJOR);
    }
  });

  it('filters by major, category and search; sorts by downloads and name', () => {
    const forLatest = listLibraries({ major: String(LATEST_MAJOR) });
    expect(forLatest.total).toBe(
      libraryHealth.filter((h) => h.majors[String(LATEST_MAJOR)]).length,
    );
    expect(forLatest.items.every((item) => item.majors[0]?.version)).toBe(true);

    const ui = listLibraries({ category: 'ui' });
    expect(ui.items.every((item) => item.category === 'ui')).toBe(true);
    expect(ui.total).toBe(ui.categories.find((c) => c.value === 'ui')?.count);

    const byName = listLibraries({ sort: 'name' }).items.map((item) => item.name);
    expect(byName).toEqual([...byName].sort((a, b) => a.localeCompare(b)));
    const byDownloads = listLibraries({ sort: 'downloads' }).items;
    expect(byDownloads[0]?.downloads).toMatch(/\/week$/);

    const first = libraryHealth[0]!;
    const searched = listLibraries({ search: first.name });
    expect(searched.items.map((item) => item.name)).toContain(first.name);
    // The facets follow the search, not the other filters.
    expect(searched.categories[0]?.count).toBe(searched.total);
    expect(listLibraries({ search: 'zzz-no-such-library' }).total).toBe(0);
  });

  it('details a library with a score per major, newest first', () => {
    const first = libraryHealth[0]!;
    const detail = libraryDetail(first.name)!;
    expect(detail.npmUrl).toBe(`https://www.npmjs.com/package/${first.name}`);
    expect(detail.majors.map((row) => row.major)).toEqual([...LIBRARY_MAJORS].reverse());
    expect(detail.majors[0]?.score).toEqual({
      score: detail.score.score,
      grade: detail.score.grade,
      blocked: detail.score.blocked,
      retired: detail.score.retired,
    });
    for (const row of detail.majors) {
      if (row.version) expect(row.released).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
      else expect(row.peer).toBeNull();
    }
    expect(libraryDetail('no-such-library')).toBeNull();
  });

  it('routes the API: the list with sanitized filters, a library by one or two segments', async () => {
    const list = (await handleLibraries(
      '/',
      new URLSearchParams('category=nope&major=abc&sort=weird&page=-3'),
    )) as { page: number; total: number };
    expect(list.page).toBe(1);
    expect(list.total).toBe(libraryHealth.length);
    const scoped = libraryRefs().find((ref) => ref.path.length === 3);
    if (scoped) {
      const detail = await handleLibraries(scoped.path.slice(1).join('/'), new URLSearchParams());
      expect(detail).toMatchObject({ name: scoped.name });
    }
    expect(await handleLibraries('/check', new URLSearchParams('package=!'))).toEqual({
      error: 'invalid-name',
    });
    expect(await handleLibraries('/a/b/c', new URLSearchParams())).toBeNull();
    expect(await handleLibraries('/no-such-library', new URLSearchParams())).toBeNull();
  });

  it('gives no score to deprecated or archived libraries, listed last', () => {
    const first = listLibraries({ sort: 'score' });
    const items = Array.from(
      { length: first.pageCount },
      (_, i) => listLibraries({ sort: 'score', page: i + 1 }).items,
    ).flat();
    const firstRetired = items.findIndex((item) => item.score.retired !== null);
    if (firstRetired >= 0) {
      expect(items.slice(firstRetired).every((item) => item.score.retired !== null)).toBe(true);
    }
    const archived = libraryHealth.find((h) => h.archived && h.deprecated === null);
    if (archived) expect(libraryDetail(archived.name)?.score.retired).toBe('archived');
  });

  it('formats downloads and paths', () => {
    expect(downloadsLabel(950)).toBe('950/week');
    expect(downloadsLabel(48_400)).toBe('48K/week');
    expect(downloadsLabel(1_288_968)).toBe('1.3M/week');
    expect(downloadsLabel(12_000_000)).toBe('12M/week');
    expect(libraryPath('@ngrx/store')).toEqual(['/libraries', '@ngrx', 'store']);
    expect(libraryPath('primeng')).toEqual(['/libraries', 'primeng']);
  });
});
