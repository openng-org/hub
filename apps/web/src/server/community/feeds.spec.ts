import { describe, expect, it } from 'vitest';

import { eventsCalendar, eventsRss, fold } from './feeds';

const TODAY = '2025-06-01';

describe('feeds', () => {
  it('builds a valid iCalendar: CRLF lines folded at 75 octets, all-day events', () => {
    const calendar = eventsCalendar(undefined, TODAY)!;
    expect(calendar.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(calendar.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    for (const line of calendar.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    const begins = calendar.match(/BEGIN:VEVENT/g)?.length ?? 0;
    expect(begins).toBeGreaterThan(0);
    expect(calendar.match(/END:VEVENT/g)?.length).toBe(begins);
    expect(calendar).toMatch(/DTSTART;VALUE=DATE:\d{8}/);
  });

  it('gives every event a unique UID, so calendar apps never merge two of them', () => {
    const uids = eventsCalendar(undefined, TODAY)!.match(/^UID:.*$/gm)!;
    expect(uids.length).toBeGreaterThan(0);
    expect(new Set(uids).size).toBe(uids.length);
    expect(uids[0]).toMatch(/^UID:[a-z0-9-]+@hub\.openng\.org$/);
  });

  it('folds long lines without cutting a multi-byte character, and unfolds back', () => {
    const line = `SUMMARY:${'Ångulär Zürich — Münchën ✓ '.repeat(8)}`;
    const folded = fold(line);
    for (const part of folded.split('\r\n')) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    }
    expect(folded.replace(/\r\n /g, '')).toBe(line);
    expect(fold('SHORT:line')).toBe('SHORT:line');
  });

  it('builds one calendar per community and refuses unknown ones', () => {
    expect(eventsCalendar('angular-athens', TODAY)).toContain('X-WR-CALNAME:Angular Athens');
    expect(eventsCalendar('nope', TODAY)).toBeNull();
  });

  it('builds an RSS feed of upcoming events and open calls for papers', () => {
    const rss = eventsRss(TODAY);
    expect(rss).toContain('<rss version="2.0"');
    expect(rss).toMatch(/<guid isPermaLink="false">event-/);
    expect(rss).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
  });
});
