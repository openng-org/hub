import { events, organizers, type Organizer } from '@openng/data-community';

import type {
  CommunityCard,
  CommunityLink,
  CommunityList,
  CommunityQuery,
} from '../../app/community/data/api';
import { memo } from '../memo';
import { matches, normalizeTerm } from '../text';
import { dateRange, relative, todayIso } from './dates';
import { countryOf, lastDay } from './events';

/** A community's events, oldest first (the dataset order). */
const eventsOf = memo((organizerId: string) =>
  events.filter((event) => event.organizerId === organizerId),
);

const LINKS: [keyof Organizer, string, string][] = [
  ['websiteUrl', 'Website', 'pi pi-globe'],
  ['eventsUrl', 'Events', 'pi pi-calendar'],
  ['youtubeUrl', 'YouTube', 'pi pi-youtube'],
  ['twitchUrl', 'Twitch', 'pi pi-twitch'],
  ['linkedinUrl', 'LinkedIn', 'pi pi-linkedin'],
  ['xUrl', 'X', 'pi pi-twitter'],
  ['blueskyUrl', 'Bluesky', 'pi pi-bluesky'],
];

interface Entry {
  card: CommunityCard;
  /** Start of their next event, for ordering ('' when none). */
  nextDate: string;
}

function toEntry(organizer: Organizer, today: string): Entry {
  const hosted = eventsOf(organizer.id);
  const next = hosted
    .filter((event) => lastDay(event) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const links = LINKS.flatMap(([key, label, icon]): CommunityLink[] => {
    const url = organizer[key];
    return typeof url === 'string' && url ? [{ label, icon, url }] : [];
  });
  if (hosted.length > 0) {
    // Their events as a calendar to subscribe to (served by src/server.ts).
    links.push({
      label: 'Subscribe to their events (calendar)',
      icon: 'pi pi-calendar-plus',
      url: `/calendar/${organizer.id}.ics`,
    });
  }
  const card: CommunityCard = {
    id: organizer.id,
    name: organizer.name,
    location: organizer.location,
    country: countryOf(organizer.location),
    logo: organizer.logo,
    url: organizer.websiteUrl ?? organizer.eventsUrl ?? links[0]?.url ?? null,
    links,
    next: next
      ? {
          name: next.name ?? organizer.name,
          dates: dateRange(next.date, next.endDate),
          relative: relative(today, next.date, next.endDate),
          url: next.url,
        }
      : null,
    eventCount: hosted.length,
    callForPapersUrl: organizer.callForPapersUrl,
  };
  return { card, nextDate: next?.date ?? '' };
}

/** Communities with an upcoming event first (soonest first), then alphabetically. */
export function listCommunities(query: CommunityQuery = {}, today = todayIso()): CommunityList {
  const term = normalizeTerm(query.search);
  const all = organizers.map((organizer) => toEntry(organizer, today));
  const items = all
    .filter(
      ({ card }) =>
        (!query.country || card.country === query.country) &&
        matches(term, card.name, card.location),
    )
    .sort((a, b) => {
      if (a.nextDate && b.nextDate) return a.nextDate.localeCompare(b.nextDate);
      if (a.nextDate || b.nextDate) return a.nextDate ? -1 : 1;
      return a.card.name.localeCompare(b.card.name);
    })
    .map(({ card }) => card);

  const counts = new Map<string, number>();
  for (const { card } of all) counts.set(card.country, (counts.get(card.country) ?? 0) + 1);
  return {
    items,
    total: items.length,
    countries: [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}
