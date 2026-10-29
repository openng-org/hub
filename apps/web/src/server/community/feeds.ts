/**
 * Subscribable feeds of the events: iCalendar (every upcoming event, or one community's) and RSS
 * (upcoming events and open calls for papers). Served by src/server.ts at /calendar/*.ics and
 * /feed.xml; built per request, since "upcoming" depends on today.
 */
import { events, type CommunityEvent } from '@openng/data-community';

import { SITE_NAME, SITE_URL } from '../../site';
import { todayIso } from './dates';
import { lastDay } from './events';
import { organizerById } from './organizers';

/** Past events kept in calendars, so a meetup does not vanish from them the day after. */
const CALENDAR_PAST_DAYS = 90;

const nameOf = (event: CommunityEvent) =>
  event.name ?? organizerById.get(event.organizerId)?.name ?? 'Angular event';

const keyOf = (event: CommunityEvent) =>
  `${event.organizerId}-${event.date}-${(event.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(
    /-+$/,
    '',
  );

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// --- iCalendar (RFC 5545) -----------------------------------------------------------------------

/** Escapes a TEXT value. */
const icsText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Folds a content line at 75 octets, as the format requires (exported for its spec). */
export function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const decoder = new TextDecoder();
  const parts: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (start === 0 ? 75 : 74), bytes.length);
    // Never cut a UTF-8 sequence in two.
    while (end < bytes.length && (bytes[end]! & 0xc0) === 0x80) end--;
    parts.push(decoder.decode(bytes.slice(start, end)));
    start = end;
  }
  return parts.join('\r\n ');
}

function vevent(event: CommunityEvent, stamp: string): string[] {
  const organizer = organizerById.get(event.organizerId);
  const details = [
    organizer ? `By ${organizer.name}` : null,
    event.isRemote && event.isOnsite ? 'On site and online' : event.isRemote ? 'Online' : null,
    event.callForPapersUrl ? `Call for papers: ${event.callForPapersUrl}` : null,
    event.description ?? null,
  ].filter(Boolean);
  return [
    'BEGIN:VEVENT',
    `UID:${keyOf(event)}@${new URL(SITE_URL).host}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${event.date.replace(/-/g, '')}`,
    // All-day events end the day after their last day (exclusive end).
    `DTEND;VALUE=DATE:${addDays(lastDay(event), 1).replace(/-/g, '')}`,
    `SUMMARY:${icsText(nameOf(event))}`,
    ...(event.location
      ? [`LOCATION:${icsText(event.location)}`]
      : event.isRemote
        ? ['LOCATION:Online']
        : []),
    ...(event.url ? [`URL:${event.url}`] : []),
    ...(details.length ? [`DESCRIPTION:${icsText(details.join('\n'))}`] : []),
    'END:VEVENT',
  ];
}

/** The events of the last 90 days and to come, for every community or one of them. */
export function eventsCalendar(organizerId?: string, today = todayIso()): string | null {
  const organizer = organizerId ? organizerById.get(organizerId) : undefined;
  if (organizerId && !organizer) return null;
  const since = addDays(today, -CALENDAR_PAST_DAYS);
  const selected = events
    .filter(
      (event) => (!organizerId || event.organizerId === organizerId) && lastDay(event) >= since,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const name = organizer ? `${organizer.name} (${SITE_NAME})` : `Angular events (${SITE_NAME})`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpenNG//Angular Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsText(name)}`,
    `X-WR-CALDESC:${icsText(organizer ? `Events of ${organizer.name}, from ${SITE_URL}` : `Angular conferences, meetups and workshops, from ${SITE_URL}/events`)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...selected.flatMap((event) => vevent(event, stamp)),
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

// --- RSS 2.0 ------------------------------------------------------------------------------------

const xml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const rfc822 = (iso: string) => new Date(`${iso}T09:00:00Z`).toUTCString();

interface FeedItem {
  title: string;
  link: string;
  guid: string;
  date: string;
  description: string;
}

/**
 * Upcoming events and the calls for papers still open, soonest first. The datasets do not record
 * when an entry was added, so an item's date is the event's (or the call's deadline).
 */
export function eventsRss(today = todayIso()): string {
  const upcoming = events.filter((event) => lastDay(event) >= today);
  const items: FeedItem[] = [
    ...upcoming.map((event) => {
      const organizer = organizerById.get(event.organizerId);
      const where = event.location ?? (event.isRemote ? 'Online' : '');
      return {
        title: `${nameOf(event)} — ${event.date}${where ? `, ${where}` : ''}`,
        link: event.url ?? `${SITE_URL}/events`,
        guid: `event-${keyOf(event)}`,
        date: event.date,
        description: [
          organizer ? `By ${organizer.name}.` : '',
          event.description ?? '',
          event.isFree ? 'Free.' : '',
        ]
          .filter(Boolean)
          .join(' '),
      };
    }),
    ...upcoming
      .filter(
        (event) =>
          event.callForPapersUrl &&
          (!event.callForPapersDueDate || event.callForPapersDueDate >= today),
      )
      .map((event) => ({
        title: `Call for papers: ${nameOf(event)}${event.callForPapersDueDate ? ` (until ${event.callForPapersDueDate})` : ''}`,
        link: event.callForPapersUrl!,
        guid: `cfp-${keyOf(event)}`,
        date: event.callForPapersDueDate ?? event.date,
        description: `Speak at ${nameOf(event)} on ${event.date}${event.location ? ` in ${event.location}` : ''}.`,
      })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Angular events and calls for papers — ${SITE_NAME}</title>
    <link>${SITE_URL}/events</link>
    <description>Upcoming Angular conferences, meetups and workshops, and the calls for papers still open.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${xml(item.title)}</title>
      <link>${xml(item.link)}</link>
      <guid isPermaLink="false">${xml(item.guid)}</guid>
      <pubDate>${rfc822(item.date)}</pubDate>
      <description>${xml(item.description)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;
}
