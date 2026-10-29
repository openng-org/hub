import type { CommunityEvent } from '@openng/data-community';
import { describe, expect, it } from 'vitest';

import { articleJsonLd, eventJsonLd, eventListJsonLd, websiteJsonLd } from './seo';

const base: CommunityEvent = {
  name: 'NG Paris #12',
  organizerId: 'angular-athens',
  type: 'meetup',
  location: 'Paris, France',
  date: '2026-03-10',
  language: 'French',
  isFree: true,
  isRemote: false,
  isOnsite: true,
  url: 'https://example.com/ng-paris-12',
  callForPapersUrl: null,
  callForPapersDueDate: null,
};

describe('JSON-LD', () => {
  it('describes an on-site free event with its place, organizer and free offer', () => {
    const data = eventJsonLd(base) as Record<string, unknown>;
    expect(data).toMatchObject({
      '@type': 'Event',
      name: 'NG Paris #12',
      startDate: '2026-03-10',
      endDate: '2026-03-10',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Paris, France' },
      inLanguage: 'French',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0 },
      organizer: { '@type': 'Organization', name: 'Angular Athens' },
    });
  });

  it('describes hybrid, online and paid events', () => {
    const hybrid = eventJsonLd({ ...base, isRemote: true, endDate: '2026-03-11' }) as {
      location: unknown[];
      endDate: string;
      eventAttendanceMode: string;
    };
    expect(hybrid.eventAttendanceMode).toBe('https://schema.org/MixedEventAttendanceMode');
    expect(hybrid.location).toHaveLength(2);
    expect(hybrid.endDate).toBe('2026-03-11');

    const online = eventJsonLd({ ...base, isOnsite: false, isRemote: true, location: null }) as {
      location: { '@type': string; url: string };
    };
    expect(online.location).toEqual({ '@type': 'VirtualLocation', url: base.url });

    const paid = eventJsonLd({ ...base, isFree: false, startingPrice: 49, currency: 'EUR' }) as {
      offers: { price: number; priceCurrency: string };
      isAccessibleForFree?: boolean;
    };
    expect(paid.offers).toMatchObject({ price: 49, priceCurrency: 'EUR' });
    expect(paid.isAccessibleForFree).toBeUndefined();
  });

  it('numbers the items of a list and stamps the site on articles', () => {
    const list = eventListJsonLd([base, { ...base, date: '2026-04-10' }]) as {
      itemListElement: { position: number }[];
    };
    expect(list.itemListElement.map((item) => item.position)).toEqual([1, 2]);

    const article = articleJsonLd({
      headline: "What's new in Angular 22",
      description: 'd',
      path: '/releases/22',
      about: 'Angular 22',
      image: '/og/releases/22.png',
    }) as { url: string; image: string; publisher: { name: string } };
    expect(article.url).toBe('https://hub.openng.org/releases/22');
    expect(article.image).toBe('https://hub.openng.org/og/releases/22.png');
    expect(article.publisher.name).toBe('OpenNG Foundation');
    expect(websiteJsonLd()).toMatchObject({ '@type': 'WebSite', url: 'https://hub.openng.org' });
  });
});
