import { describe, expect, it } from 'vitest';

import { handleApi } from './api';
import { normalize, search, SEARCH_GROUP_LIMIT } from './search';

const TODAY = '2026-10-30';

describe('site search', () => {
  it('needs two characters and ignores case and accents', () => {
    expect(search('a', TODAY)).toEqual({ query: 'a', groups: [], total: 0 });
    expect(normalize('  Zürich   Angular ')).toBe('zurich angular');
    expect(search('SIGNAL', TODAY).total).toBe(search('signal', TODAY).total);
  });

  it('finds features, migrations and pages, each pointing at its page', () => {
    const results = search('resource', TODAY);
    const kinds = results.groups.map((group) => group.kind);
    expect(kinds).toContain('feature');
    const feature = results.groups.find((group) => group.kind === 'feature')!.items[0]!;
    expect(feature.where).toBe('Can I Use · Features');
    expect(feature.link).toEqual({
      path: ['/caniuse'],
      queryParams: { search: feature.title, package: feature.subtitle },
    });

    const update = search('ng update', TODAY).groups.find((group) => group.kind === 'page')!;
    expect(update.items[0]).toMatchObject({
      title: 'NG Update',
      link: { path: ['/caniuse', 'update'] },
    });
  });

  it('ranks title matches first and requires every word', () => {
    const features = search('httpresource', TODAY).groups.find((g) => g.kind === 'feature')!;
    expect(features.items[0]!.title).toBe('httpResource()');
    const resource = search('resource', TODAY).groups.find((g) => g.kind === 'feature')!;
    // An API name does not pull in unrelated pages through their keywords.
    expect(search('resource', TODAY).groups.some((g) => g.kind === 'page')).toBe(false);
    // MCP items are not found by their type.
    expect(search('resource', TODAY).groups.some((g) => g.kind === 'mcp')).toBe(false);
    expect(resource.items[0]!.title).toBe('resource()');
    expect(search('signal zzzz', TODAY).total).toBe(0);
  });

  it('caps each group and links to the full filtered list', () => {
    const features = search('signal', TODAY).groups.find((g) => g.kind === 'feature')!;
    expect(features.items.length).toBeLessThanOrEqual(SEARCH_GROUP_LIMIT);
    if (features.total > SEARCH_GROUP_LIMIT) {
      expect(features.more).toEqual({ path: ['/caniuse'], queryParams: { search: 'signal' } });
    }
  });

  it('sends events to the right list: upcoming, or past with the filter set', () => {
    const events = search('angular athens', TODAY).groups.find((g) => g.kind === 'event')!;
    expect(events.items.length).toBeGreaterThan(0);
    for (const item of events.items) {
      const link = item.link as { path: string[]; queryParams: Record<string, string> };
      expect(link.path).toEqual(['/events']);
      expect(item.where === 'Events').toBe(!('when' in link.queryParams));
    }
  });

  it('points "See all" for past events at the past list', () => {
    const events = search('paris angular', TODAY).groups.find((g) => g.kind === 'event')!;
    if (events.more) {
      expect(events.more).toEqual({
        path: ['/events'],
        queryParams: { search: 'paris angular', when: 'past' },
      });
    }
  });

  it('opens podcasts on their own site', () => {
    const podcast = search('angular air', TODAY).groups.find((g) => g.kind === 'podcast')!;
    expect(podcast.items[0]!.link).toEqual({ href: expect.stringMatching(/^https?:\/\//) });
  });

  it('is served at /api/search?q=', async () => {
    const results = (await handleApi('/search', new URLSearchParams({ q: 'eslint' }))) as {
      total: number;
    };
    expect(results.total).toBeGreaterThan(0);
    expect(await handleApi('/search/extra', new URLSearchParams())).toBeNull();
  });
});
