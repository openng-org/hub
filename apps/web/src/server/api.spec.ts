import { describe, expect, it } from 'vitest';

import { handleApi } from './api';
import { homeStats } from './home';
import { LATEST_RELEASE_MAJOR } from './releases/versions';
import { contributeOptions } from './community/contribute';

const get = (path: string, query = '') => handleApi(path, new URLSearchParams(query));

/** Every area answers through one dispatcher; unknown paths are `null` (a 404 over HTTP). */
describe('handleApi', () => {
  it('routes each area and answers null anywhere else', async () => {
    const major = String(LATEST_RELEASE_MAJOR);
    const answered = [
      '/caniuse/summary',
      '/community/podcasts',
      '/home',
      '/releases',
      `/releases/${major}`,
      `/releases/${major}/features`,
      `/releases/${major}/guide`,
      `/releases/${major}/update`,
      `/releases/${major}/commits`,
      `/releases/${major}/mcp`,
      `/releases/${major}/eslint`,
      `/releases/${major}/changelogs`,
    ];
    for (const path of answered) expect(await get(path), path).not.toBeNull();
    const refused = [
      '/',
      '/nope',
      '/home/extra',
      `/releases/${major}/nope`,
      `/releases/${major}/commits/extra`,
      '/releases/abc',
      '/releases/3',
      '/releases/%E0%A4%A',
    ];
    for (const path of refused) expect(await get(path), path).toBeNull();
  });

  it('passes the query string on to the views', async () => {
    const major = String(LATEST_RELEASE_MAJOR);
    const commits = (await get(`/releases/${major}/commits`, 'page=2&type=fix')) as {
      page: number;
      items: { type: string }[];
    };
    expect(commits.page).toBe(2);
    expect(commits.items.every((commit) => commit.type === 'fix')).toBe(true);
    const guide = (await get(`/releases/${major}/guide`, 'criticality=high')) as {
      guides: { changes: { criticality: string }[] }[];
    };
    expect(guide.guides.flatMap((g) => g.changes).every((c) => c.criticality === 'high')).toBe(
      true,
    );
  });
});

describe('home', () => {
  it('counts what the hub tracks and links every number to its page', async () => {
    const home = await homeStats('2026-10-29');
    expect(home.stats.map((stat) => stat.label)).toEqual([
      'Latest Angular',
      'Features tracked',
      'ng update migrations',
      'Release commits',
      'Communities',
      'Podcasts',
    ]);
    expect(home.stats[0]!.value).toBe(`v${LATEST_RELEASE_MAJOR}`);
    for (const stat of home.stats) {
      expect(stat.link[0]).toMatch(/^\//);
      expect(stat.value).toMatch(/^v?\d[\d,]*$/);
    }
    expect(home.timeline.majors.length).toBeGreaterThan(10);
  });
});

describe('contribute options', () => {
  it('offers the organizers, places and languages the datasets already use', () => {
    const options = contributeOptions();
    const labels = options.organizers.map((organizer) => organizer.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    expect(options.places).toContain('Paris, France');
    expect(options.languages[0]).toBe('English');
    expect(options.podcastNames.length).toBeGreaterThan(0);
  });
});
