import { describe, expect, it } from 'vitest';

import { listCommunities } from './communities';
import { listEvents, PAST_PAGE_SIZE } from './events';
import { handleCommunity } from './handle';
import { eventMap } from './map';
import { listPodcasts } from './podcasts';

const TODAY = '2025-06-01';

describe('events', () => {
  it('lists upcoming events soonest first, grouped by month', () => {
    const { months, total } = listEvents({}, TODAY);
    const keys = months.map((m) => m.key);
    expect(keys).toEqual([...keys].sort());
    expect(months.flatMap((m) => m.events)).toHaveLength(total);
  });

  it('pages past events newest first', () => {
    const page1 = listEvents({ when: 'past' }, TODAY);
    expect(page1.pageCount).toBe(Math.ceil(page1.total / PAST_PAGE_SIZE));
    const keys = page1.months.map((m) => m.key);
    expect(keys).toEqual([...keys].sort().reverse());
  });

  it('filters by type, format and search (name, place, organizer)', () => {
    const conferences = listEvents({ when: 'past', type: 'conference' }, TODAY);
    expect(conferences.months.flatMap((m) => m.events).every((e) => e.type === 'conference')).toBe(
      true,
    );
    const online = listEvents({ when: 'past', format: 'online' }, TODAY);
    expect(
      online.months
        .flatMap((m) => m.events)
        .every((e) => e.place === 'Online' || e.format === 'online'),
    ).toBe(true);
    const paris = listEvents({ when: 'past', search: 'paris' }, TODAY);
    expect(paris.total).toBeGreaterThan(0);
  });
});

describe('communities and podcasts', () => {
  it('puts communities with an upcoming event first and counts countries', () => {
    const list = listCommunities({}, TODAY);
    const firstIdle = list.items.findIndex((card) => !card.next);
    expect(list.items.slice(firstIdle).every((card) => !card.next)).toBe(true);
    expect(list.countries.reduce((sum, c) => sum + c.count, 0)).toBe(list.total);
    const france = listCommunities({ country: 'France' }, TODAY);
    expect(france.items.every((card) => card.country === 'France')).toBe(true);
  });

  it('lists podcasts still publishing first', () => {
    const { items } = listPodcasts();
    const firstOff = items.findIndex((p) => p.lastEpisode);
    expect(firstOff === -1 || items.slice(firstOff).every((p) => p.lastEpisode)).toBe(true);
  });

  it('routes known paths and answers null otherwise', async () => {
    expect(await handleCommunity('/events', new URLSearchParams('when=past'))).toMatchObject({
      when: 'past',
    });
    expect(await handleCommunity('/nope', new URLSearchParams())).toBeNull();
  });
});

describe('events map', () => {
  it('places every on-site event once, inside the map, and counts the rest as online', () => {
    const map = eventMap({ when: 'past' }, TODAY);
    const placed = map.places.reduce((sum, place) => sum + place.events.length, 0);
    expect(placed).toBe(map.onMap);
    for (const place of map.places) {
      expect(place.x >= 0 && place.x <= 360 && place.y >= 0 && place.y <= 136, place.label).toBe(
        true,
      );
    }
    expect(map.regions[0]?.count).toBe(map.onMap);
    expect(map.places.at(-1)!.count).toBeGreaterThanOrEqual(map.places[0]!.count);
  });
});
