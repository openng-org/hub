/**
 * schema.org data (JSON-LD) for rich search results, built from the datasets next to the views
 * that use it. The UI only drops it in the page head (app/core/seo.ts).
 */
import type { CommunityEvent } from '@openng/data-community';

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../site';
import { organizerById } from './community/organizers';

export const PUBLISHER = {
  '@type': 'Organization',
  name: 'OpenNG Foundation',
  url: 'https://github.com/openng-org',
};

export function websiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: PUBLISHER,
  };
}

/** One event: dates, attendance mode, place or online location, organizer and price. */
export function eventJsonLd(event: CommunityEvent): object {
  const organizer = organizerById.get(event.organizerId);
  const online = { '@type': 'VirtualLocation', url: event.url ?? organizer?.eventsUrl ?? SITE_URL };
  const place = event.location
    ? { '@type': 'Place', name: event.location, address: event.location }
    : null;
  const mode = event.isOnsite && event.isRemote ? 'Mixed' : event.isOnsite ? 'Offline' : 'Online';
  // ISO 4217 in the data, which is what schema.org expects.
  const currency = event.currency ?? undefined;
  return {
    '@type': 'Event',
    name: event.name ?? organizer?.name ?? 'Angular event',
    startDate: event.date,
    endDate: event.endDate ?? event.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: `https://schema.org/${mode}EventAttendanceMode`,
    location:
      mode === 'Mixed' && place ? [place, online] : mode === 'Online' || !place ? online : place,
    ...(event.url ? { url: event.url } : {}),
    ...(event.description ? { description: event.description } : {}),
    inLanguage: event.language,
    ...(organizer
      ? {
          organizer: {
            '@type': 'Organization',
            name: organizer.name,
            ...(organizer.websiteUrl || organizer.eventsUrl
              ? { url: organizer.websiteUrl ?? organizer.eventsUrl }
              : {}),
          },
        }
      : {}),
    ...(event.isFree
      ? { isAccessibleForFree: true, offers: { '@type': 'Offer', price: 0, url: event.url } }
      : event.startingPrice
        ? {
            offers: {
              '@type': 'Offer',
              price: event.startingPrice,
              ...(currency ? { priceCurrency: currency } : {}),
              ...(event.url ? { url: event.url } : {}),
            },
          }
        : {}),
  };
}

/** A list of events, as Google's event carousel reads it. */
export function eventListJsonLd(events: CommunityEvent[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: eventJsonLd(event),
    })),
  };
}

/** A documentation page about one Angular topic (a feature, a release). */
export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  about: string;
  image: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.headline,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    image: `${SITE_URL}${input.image}`,
    about: { '@type': 'Thing', name: input.about },
    proficiencyLevel: 'Beginner',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: PUBLISHER,
  };
}
