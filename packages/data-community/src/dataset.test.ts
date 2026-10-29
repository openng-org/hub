import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { events, organizers, places, podcasts } from './index';
import {
  type Submission,
  validateEvent,
  validateOrganizer,
  validatePodcast,
  validateSubmission,
} from './validate';

/**
 * Guards for community PRs: a broken entry fails CI before it reaches the site. The entries follow
 * the same rules as the "Add to the hub" form (validate.ts), so a contribution that passes the form
 * is a contribution that passes here.
 */
const context = {
  organizerIds: new Set(organizers.map((o) => o.id)),
  places: new Set(Object.keys(places)),
  podcastNames: new Set(podcasts.map((p) => p.name)),
};

const eventLabel = (event: (typeof events)[number]) =>
  `${event.organizerId} ${event.date}${event.name ? ` ${event.name}` : ''}`;

describe('organizers', () => {
  it('have unique ids', () => {
    const ids = organizers.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('follow the contribution rules', () => {
    for (const organizer of organizers) {
      expect(validateOrganizer(organizer, context), organizer.id).toEqual([]);
    }
  });
});

describe('events', () => {
  it('follow the contribution rules', () => {
    for (const event of events) {
      expect(validateEvent(event, context), eventLabel(event)).toEqual([]);
    }
  });

  it('are listed once (community, date and name)', () => {
    const keys = events.map((e) => `${e.organizerId}|${e.date}|${e.name ?? ''}`);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    expect(duplicates).toEqual([]);
  });

  it('have coordinates for every on-site location, and no stale place (data/places.json)', () => {
    const used = new Set(events.filter((e) => e.isOnsite && e.location).map((e) => e.location!));
    expect([...used].filter((location) => !places[location])).toEqual([]);
    expect(Object.keys(places).filter((location) => !used.has(location))).toEqual([]);
    for (const [name, [lat, lng]] of Object.entries(places)) {
      expect(Math.abs(lat) <= 90 && Math.abs(lng) <= 180, name).toBe(true);
    }
  });
});

describe('podcasts', () => {
  it('have unique names and follow the contribution rules', () => {
    const names = podcasts.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
    for (const podcast of podcasts) {
      expect(validatePodcast(podcast, context), podcast.name).toEqual([]);
      if (podcast.lastActive) expect(podcast.lastActive, podcast.name).toMatch(/^\d{4}-\d{2}$/);
    }
  });
});

describe('inbox', () => {
  const inbox = join(import.meta.dirname, '../data/inbox');
  const files = readdirSync(inbox).filter((file) => file.endsWith('.json'));

  it('holds only contributions waiting to be merged', () => {
    expect(files.every((file) => /^(event|community|podcast)-[\w.-]+\.json$/.test(file))).toBe(
      true,
    );
  });

  it.skipIf(files.length === 0).each(files)('%s follows the contribution rules', (file) => {
    const submission = JSON.parse(readFileSync(join(inbox, file), 'utf8')) as Submission;
    expect(validateSubmission(submission, context)).toEqual([]);
  });
});
