import { describe, expect, it } from 'vitest';

import type { ContributeOptions } from '../data/api';
import {
  EMPTY_DRAFT,
  communityIdOf,
  inboxPath,
  isNewPlace,
  issuesOf,
  kindOf,
  pullRequestUrl,
  submissionJson,
  toSubmission,
} from './draft';

const options: ContributeOptions = {
  organizers: [{ value: 'angular-lyon', label: 'Angular Lyon' }],
  places: ['Paris, France'],
  podcastNames: ['Angular Air'],
  languages: ['English', 'French'],
};

describe('contribution draft', () => {
  it('defaults to an event and reads the kind from the URL', () => {
    expect(kindOf('')).toBe('event');
    expect(kindOf('podcast')).toBe('podcast');
    expect(kindOf('nope')).toBe('event');
  });

  it('turns an event form into a dataset entry, trimming and dropping empty fields', () => {
    const submission = toSubmission(
      'event',
      {
        ...EMPTY_DRAFT,
        name: '  NG Lyon #3 ',
        organizerId: 'angular-lyon',
        type: 'conference',
        format: 'hybrid',
        location: 'Lyon, France',
        latitude: '45.76',
        longitude: '4.83',
        date: '2026-05-12',
        endDate: '2026-05-13',
        url: 'https://example.com',
        price: 'paid',
        startingPrice: '49',
        currency: 'eur',
        description: '  ',
      },
      options.places,
    );
    expect(submission).toEqual({
      kind: 'event',
      event: {
        name: 'NG Lyon #3',
        organizerId: 'angular-lyon',
        type: 'conference',
        location: 'Lyon, France',
        date: '2026-05-12',
        endDate: '2026-05-13',
        language: 'English',
        isFree: false,
        isRemote: true,
        isOnsite: true,
        url: 'https://example.com',
        callForPapersUrl: null,
        callForPapersDueDate: null,
        startingPrice: 49,
        currency: 'EUR',
      },
      place: [45.76, 4.83],
    });
    expect(issuesOf(submission, options)).toEqual([]);
  });

  it('asks for coordinates only for a new city, and none online', () => {
    const draft = { ...EMPTY_DRAFT, location: 'Paris, France' };
    expect(isNewPlace(draft, options.places)).toBe(false);
    expect(isNewPlace({ ...draft, location: 'Lyon, France' }, options.places)).toBe(true);
    const online = toSubmission('event', { ...draft, format: 'online' }, options.places);
    expect(online.kind === 'event' && online.event.location).toBeNull();
    expect('place' in online).toBe(false);
  });

  it('derives a community id from its name unless one is typed', () => {
    expect(communityIdOf({ ...EMPTY_DRAFT, name: 'Angular Lyon' })).toBe('angular-lyon');
    expect(communityIdOf({ ...EMPTY_DRAFT, name: 'Angular Lyon', id: 'ng-lyon' })).toBe('ng-lyon');
    const submission = toSubmission(
      'community',
      { ...EMPTY_DRAFT, name: 'Angular Nantes', websiteUrl: 'https://angular-nantes.fr' },
      [],
    );
    expect(submission).toMatchObject({
      kind: 'community',
      community: { id: 'angular-nantes', name: 'Angular Nantes', location: null },
    });
    expect(issuesOf(submission, options)).toEqual([]);
    // An id another community already uses is refused.
    const taken = toSubmission('community', { ...EMPTY_DRAFT, name: 'Angular Lyon' }, []);
    expect(issuesOf(taken, options).map((issue) => issue.field)).toContain('id');
  });

  it('reports what the dataset would reject', () => {
    const empty = toSubmission('podcast', EMPTY_DRAFT, []);
    const fields = issuesOf(empty, options).map((issue) => issue.field);
    expect(fields).toContain('name');
    expect(fields).toContain('url');
    const duplicate = toSubmission(
      'podcast',
      {
        ...EMPTY_DRAFT,
        name: 'Angular Air',
        url: 'https://example.com',
        logo: 'https://example.com/a.png',
        description: 'A show',
      },
      [],
    );
    expect(issuesOf(duplicate, options).map((issue) => issue.field)).toEqual(['name']);
  });

  it("names the inbox file and fills GitHub's new-file page", () => {
    const submission = toSubmission(
      'event',
      { ...EMPTY_DRAFT, name: 'NG Lyon #3', organizerId: 'angular-lyon', date: '2026-05-12' },
      [],
    );
    expect(inboxPath(submission)).toMatch(/^packages\/data-community\/data\/inbox\/.+\.json$/);
    const url = new URL(pullRequestUrl(submission));
    expect(url.origin + url.pathname).toBe(
      'https://github.com/openng-org/hub/new/main/packages/data-community/data/inbox',
    );
    expect(url.searchParams.get('filename')).toBe(inboxPath(submission).split('/').pop());
    expect(url.searchParams.get('value')).toBe(submissionJson(submission));
    expect(submissionJson(submission).endsWith('\n')).toBe(true);
  });
});
