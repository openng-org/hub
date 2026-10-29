import { events, type CommunityEvent } from '@openng/data-community';

import type {
  EventCard,
  EventFormat,
  EventList,
  EventMonth,
  EventQuery,
  EventWhen,
} from '../../app/community/data/api';
import { paginate } from '../query';
import { eventListJsonLd } from '../seo';
import { matches, normalizeTerm } from '../text';
import { dateRange, monthOf, relative, shortDate, tile, todayIso } from './dates';
import { organizerById } from './organizers';

/** Past events per page (upcoming ones always fit on one). */
export const PAST_PAGE_SIZE = 30;

const TYPE_LABELS: Record<string, string> = {
  conference: 'Conference',
  meetup: 'Meetup',
  workshop: 'Workshop',
  other: 'Event',
};
const FORMAT_LABELS: Record<EventFormat, string> = {
  online: 'Online',
  'in-person': 'In person',
  hybrid: 'Hybrid',
};
/** The data holds ISO 4217 codes; the card shows the usual symbol when there is one. */
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  PLN: 'zł',
  INR: '₹',
  ILS: '₪',
};

export function formatOf(event: CommunityEvent): EventFormat {
  if (event.isRemote && event.isOnsite) return 'hybrid';
  return event.isOnsite ? 'in-person' : 'online';
}

/** The last day of an event (its start for one-day events). */
export function lastDay(event: CommunityEvent): string {
  return event.endDate ?? event.date;
}

/** Country of a "City, Country" location; "Online" when there is none. */
export function countryOf(location: string | null): string {
  if (!location) return 'Online';
  const country = location
    .split(',')
    .pop()!
    .replace(/\(.*?\)/g, '')
    .trim();
  return country || 'Online';
}

function price(event: CommunityEvent): string | null {
  if (event.isFree) return 'Free';
  if (event.startingPrice) {
    const currency = event.currency ? (CURRENCY_SYMBOLS[event.currency] ?? event.currency) : '';
    return `From ${event.startingPrice}${currency ? ` ${currency}` : ''}`;
  }
  return null;
}

export function toCard(event: CommunityEvent, today: string): EventCard {
  const organizer = organizerById.get(event.organizerId);
  const format = formatOf(event);
  const open =
    event.callForPapersUrl && (!event.callForPapersDueDate || event.callForPapersDueDate >= today);
  return {
    key: `${event.organizerId}/${event.date}/${event.name ?? ''}`,
    name: event.name ?? organizer?.name ?? 'Angular event',
    url: event.url,
    type: event.type,
    typeLabel: TYPE_LABELS[event.type] ?? 'Event',
    format,
    formatLabel: FORMAT_LABELS[format],
    organizer: organizer ? { id: organizer.id, name: organizer.name, logo: organizer.logo } : null,
    place: event.location ?? 'Online',
    language: event.language,
    price: price(event),
    tile: tile(event.date),
    dates: dateRange(event.date, event.endDate),
    relative: relative(today, event.date, event.endDate),
    cfp: open
      ? {
          url: event.callForPapersUrl!,
          due: event.callForPapersDueDate ? shortDate(event.callForPapersDueDate) : null,
        }
      : null,
    description: event.description ?? null,
  };
}

/** Upcoming: not over yet, soonest first. Past: newest first. */
function selectEvents(when: EventWhen, today: string): CommunityEvent[] {
  return when === 'upcoming'
    ? events.filter((e) => lastDay(e) >= today).sort((a, b) => a.date.localeCompare(b.date))
    : events.filter((e) => lastDay(e) < today).sort((a, b) => b.date.localeCompare(a.date));
}

/** Events of the selection (upcoming or past) matching the type, format and search filters. */
export function matchingEvents(query: EventQuery, today: string): CommunityEvent[] {
  const when: EventWhen = query.when === 'past' ? 'past' : 'upcoming';
  const term = normalizeTerm(query.search);
  return selectEvents(when, today).filter(
    (event) =>
      (!query.type || event.type === query.type) &&
      (!query.format || formatOf(event) === query.format) &&
      matches(term, event.name, event.location, organizerById.get(event.organizerId)?.name),
  );
}

export function listEvents(query: EventQuery = {}, today = todayIso()): EventList {
  const when: EventWhen = query.when === 'past' ? 'past' : 'upcoming';
  const matching = matchingEvents(query, today);
  // Upcoming events all fit on one page; past ones are paged.
  const {
    items: slice,
    page,
    pageCount,
  } = paginate(
    matching,
    query.page ?? 1,
    when === 'past' ? PAST_PAGE_SIZE : Math.max(1, matching.length),
  );

  const months: EventMonth[] = [];
  for (const event of slice) {
    const { key, label } = monthOf(event.date);
    let month = months[months.length - 1];
    if (month?.key !== key) {
      month = { key, label, events: [] };
      months.push(month);
    }
    month.events.push(toCard(event, today));
  }
  return {
    when,
    months,
    total: matching.length,
    page,
    pageCount,
    jsonLd: when === 'upcoming' && slice.length > 0 ? eventListJsonLd(slice) : null,
  };
}
