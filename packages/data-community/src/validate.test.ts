import { describe, expect, it } from 'vitest';

import type { CommunityEvent, Organizer, Podcast } from './models';
import {
  slugify,
  submissionFileName,
  validateEvent,
  validateOrganizer,
  validatePodcast,
  validateSubmission,
  type ValidationContext,
} from './validate';

/** The rules the form, the inbox test and the merge script share: one failing case per rule. */
const context: ValidationContext = {
  organizerIds: new Set(['ng-paris']),
  places: new Set(['Paris, France']),
  podcastNames: new Set(['Angular Air']),
};

const event: CommunityEvent = {
  name: 'NG Paris 2026',
  organizerId: 'ng-paris',
  type: 'conference',
  location: 'Paris, France',
  date: '2026-11-12',
  endDate: '2026-11-13',
  language: 'English',
  isFree: false,
  isRemote: false,
  isOnsite: true,
  url: 'https://ngparis.example/2026',
  callForPapersUrl: 'https://ngparis.example/cfp',
  callForPapersDueDate: '2026-06-01',
  startingPrice: 199,
  currency: 'EUR',
};

const organizer: Organizer = {
  id: 'ng-lyon',
  name: 'NG Lyon',
  location: 'Lyon, France',
  logo: '/logos/ng-lyon.webp',
  eventsUrl: 'https://www.meetup.com/ng-lyon/',
  websiteUrl: null,
  organizersUrl: null,
  blueskyUrl: null,
  xUrl: null,
  linkedinUrl: null,
  youtubeUrl: null,
  twitchUrl: null,
  callForPapersUrl: null,
};

const podcast: Podcast = {
  name: 'Angular Nights',
  url: 'https://angularnights.example',
  logo: 'https://angularnights.example/logo.png',
  language: 'English',
  description: 'A show about Angular.',
};

const fields = (issues: { field: string }[]) => issues.map((issue) => issue.field);

describe('validateEvent', () => {
  it('accepts a complete event', () => {
    expect(validateEvent(event, context)).toEqual([]);
  });

  it.each([
    ['organizerId', { organizerId: 'unknown' }],
    ['type', { type: 'party' as CommunityEvent['type'] }],
    ['date', { date: '12/11/2026' }],
    ['date', { date: '' }],
    ['endDate', { endDate: '2026-11-11' }],
    ['format', { isOnsite: false, isRemote: false }],
    ['location', { location: '  ' }],
    ['language', { language: '' }],
    ['url', { url: 'ngparis.example' }],
    ['callForPapersUrl', { callForPapersUrl: 'ftp://x' }],
    ['callForPapersDueDate', { callForPapersDueDate: 'June' }],
    ['startingPrice', { startingPrice: 0 }],
    ['startingPrice', { isFree: true }],
    ['currency', { currency: '€' }],
    ['name', { name: '' }],
  ])('flags %s', (field, change) => {
    expect(fields(validateEvent({ ...event, ...change }, context))).toContain(field);
  });

  it('lets a recurring meetup go without a name in the dataset, not in a contribution', () => {
    const nameless = { ...event, name: null };
    expect(validateEvent(nameless, context)).toEqual([]);
    expect(fields(validateEvent(nameless, context, { isNew: true }))).toEqual(['name']);
  });

  it('does not ask online events for a location', () => {
    expect(
      validateEvent({ ...event, isOnsite: false, isRemote: true, location: null }, context),
    ).toEqual([]);
  });
});

describe('validateOrganizer', () => {
  it('accepts a community with an events page', () => {
    expect(validateOrganizer(organizer, context)).toEqual([]);
  });

  it.each([
    ['name', { name: ' ' }],
    ['id', { id: 'NG Lyon' }],
    ['logo', { logo: 'logo.webp' }],
    ['xUrl', { xUrl: 'x.com/nglyon' }],
    ['websiteUrl', { eventsUrl: null }],
  ])('flags %s', (field, change) => {
    expect(fields(validateOrganizer({ ...organizer, ...change }, context))).toContain(field);
  });

  it('refuses a taken id for a new community only', () => {
    const taken = { ...organizer, id: 'ng-paris' };
    expect(validateOrganizer(taken, context)).toEqual([]);
    expect(fields(validateOrganizer(taken, context, { isNew: true }))).toEqual(['id']);
  });
});

describe('validatePodcast', () => {
  it('accepts a complete podcast', () => {
    expect(validatePodcast(podcast, context)).toEqual([]);
  });

  it.each([
    ['name', { name: '' }],
    ['url', { url: 'angularnights.example' }],
    ['logo', { logo: 'logo.png' }],
    ['language', { language: '' }],
    ['description', { description: '' }],
  ])('flags %s', (field, change) => {
    expect(fields(validatePodcast({ ...podcast, ...change }, context))).toContain(field);
  });

  it('refuses a listed name for a new podcast only', () => {
    const listed = { ...podcast, name: 'Angular Air' };
    expect(validatePodcast(listed, context)).toEqual([]);
    expect(fields(validatePodcast(listed, context, { isNew: true }))).toEqual(['name']);
  });
});

describe('validateSubmission', () => {
  it('asks for coordinates when an on-site event is in a new city', () => {
    const lyon = { ...event, location: 'Lyon, France' };
    expect(fields(validateSubmission({ kind: 'event', event: lyon }, context))).toEqual(['place']);
    expect(
      validateSubmission({ kind: 'event', event: lyon, place: [45.76, 4.84] }, context),
    ).toEqual([]);
    expect(
      fields(validateSubmission({ kind: 'event', event: lyon, place: [95, 4.84] }, context)),
    ).toEqual(['place']);
  });

  it('applies the new-entry rules to communities and podcasts', () => {
    expect(
      fields(
        validateSubmission(
          { kind: 'community', community: { ...organizer, id: 'ng-paris' } },
          context,
        ),
      ),
    ).toEqual(['id']);
    expect(
      fields(
        validateSubmission(
          { kind: 'podcast', podcast: { ...podcast, name: 'Angular Air' } },
          context,
        ),
      ),
    ).toEqual(['name']);
  });
});

describe('slugify and file names', () => {
  it('turns a name into a slug, accents included', () => {
    expect(slugify('NG Paris 2026!')).toBe('ng-paris-2026');
    expect(slugify('Café Angular — São Paulo')).toBe('cafe-angular-sao-paulo');
    expect(slugify('***')).toBe('');
  });

  it('names inbox files after the contribution', () => {
    expect(submissionFileName({ kind: 'event', event })).toBe(
      'event-2026-11-12-ng-paris-2026.json',
    );
    expect(submissionFileName({ kind: 'event', event: { ...event, name: null } })).toBe(
      'event-2026-11-12-event.json',
    );
    expect(submissionFileName({ kind: 'community', community: organizer })).toBe(
      'community-ng-lyon.json',
    );
    expect(submissionFileName({ kind: 'podcast', podcast })).toBe('podcast-angular-nights.json');
    // What the inbox test accepts.
    for (const name of [
      submissionFileName({ kind: 'event', event }),
      submissionFileName({ kind: 'community', community: organizer }),
      submissionFileName({ kind: 'podcast', podcast }),
    ]) {
      expect(name).toMatch(/^(event|community|podcast)-[\w.-]+\.json$/);
    }
  });
});
