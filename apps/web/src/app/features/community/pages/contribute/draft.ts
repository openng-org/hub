import {
  EVENT_TYPES,
  slugify,
  submissionFileName,
  validateSubmission,
  type Issue,
  type Submission,
} from '@openng/data-community/validate';

import type { ChipOption } from '../../../../shared/components/chip-filter';
import type { ContributeOptions } from '../../community.model';

/** Where a contribution lands: a new file in the inbox of the data package. */
export const REPOSITORY = 'openng-org/hub';
export const BRANCH = 'main';
export const INBOX = 'packages/data-community/data/inbox';

export type Kind = 'event' | 'community' | 'podcast';

/** The `?kind=` parameter; an event by default. */
export function kindOf(value: string): Kind {
  return value === 'community' || value === 'podcast' ? value : 'event';
}

export const KIND_OPTIONS: ChipOption[] = [
  { value: 'event', label: 'An event', icon: 'pi pi-calendar' },
  { value: 'community', label: 'A community', icon: 'pi pi-users' },
  { value: 'podcast', label: 'A podcast', icon: 'pi pi-microphone' },
];
export const TYPE_OPTIONS: ChipOption[] = [
  { value: 'conference', label: 'Conference' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
];
export const FORMAT_OPTIONS: ChipOption[] = [
  { value: 'in-person', label: 'In person', icon: 'pi pi-map-marker' },
  { value: 'online', label: 'Online', icon: 'pi pi-globe' },
  { value: 'hybrid', label: 'Hybrid', icon: 'pi pi-arrow-right-arrow-left' },
];
export const PRICE_OPTIONS: ChipOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

/** The form's fields, all as typed (strings); `toSubmission()` turns them into a dataset entry. */
export const EMPTY_DRAFT = {
  name: '',
  organizerId: '',
  type: 'meetup',
  format: 'in-person',
  location: '',
  latitude: '',
  longitude: '',
  date: '',
  endDate: '',
  language: 'English',
  url: '',
  price: 'free',
  startingPrice: '',
  /** ISO 4217 code; the site shows the symbol. */
  currency: 'EUR',
  callForPapersUrl: '',
  callForPapersDueDate: '',
  description: '',
  id: '',
  logo: '',
  websiteUrl: '',
  eventsUrl: '',
  organizersUrl: '',
  blueskyUrl: '',
  xUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  twitchUrl: '',
};
export type Draft = typeof EMPTY_DRAFT;

/** A community's links, in form order; the website is the one that is not optional. */
export const COMMUNITY_LINKS: { key: keyof Draft; label: string }[] = [
  { key: 'websiteUrl', label: 'Website' },
  { key: 'eventsUrl', label: 'Events page (Meetup, Luma…)' },
  { key: 'organizersUrl', label: 'Organizers page' },
  { key: 'blueskyUrl', label: 'Bluesky' },
  { key: 'xUrl', label: 'X' },
  { key: 'linkedinUrl', label: 'LinkedIn' },
  { key: 'youtubeUrl', label: 'YouTube' },
  { key: 'twitchUrl', label: 'Twitch' },
  { key: 'callForPapersUrl', label: 'Call for papers' },
];

const orNull = (value: string) => value.trim() || null;

/** The community's id: as typed, or derived from its name. */
export function communityIdOf(draft: Draft): string {
  return draft.id || slugify(draft.name);
}

/** An on-site event in a city the map does not know yet (its coordinates are asked for). */
export function isNewPlace(draft: Draft, knownPlaces: readonly string[]): boolean {
  const location = draft.location.trim();
  return !!location && !knownPlaces.includes(location);
}

/** The dataset entry the form describes. */
export function toSubmission(kind: Kind, d: Draft, knownPlaces: readonly string[]): Submission {
  switch (kind) {
    case 'event': {
      const onsite = d.format !== 'online';
      const paid = d.price === 'paid';
      const latitude = Number.parseFloat(d.latitude);
      const longitude = Number.parseFloat(d.longitude);
      return {
        kind: 'event',
        event: {
          name: d.name.trim(),
          organizerId: d.organizerId,
          type: d.type as (typeof EVENT_TYPES)[number],
          location: onsite ? orNull(d.location) : null,
          date: d.date,
          ...(d.endDate && d.endDate !== d.date ? { endDate: d.endDate } : {}),
          language: d.language.trim(),
          isFree: !paid,
          isRemote: d.format !== 'in-person',
          isOnsite: onsite,
          url: orNull(d.url),
          callForPapersUrl: orNull(d.callForPapersUrl),
          callForPapersDueDate: orNull(d.callForPapersDueDate),
          ...(d.description.trim() ? { description: d.description.trim() } : {}),
          ...(paid && d.startingPrice
            ? { startingPrice: Number(d.startingPrice), currency: orNull(d.currency.toUpperCase()) }
            : {}),
        },
        ...(onsite &&
        isNewPlace(d, knownPlaces) &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
          ? { place: [latitude, longitude] as [number, number] }
          : {}),
      };
    }
    case 'community':
      return {
        kind: 'community',
        community: {
          id: communityIdOf(d),
          name: d.name.trim(),
          location: orNull(d.location),
          logo: orNull(d.logo),
          eventsUrl: orNull(d.eventsUrl),
          websiteUrl: orNull(d.websiteUrl),
          organizersUrl: orNull(d.organizersUrl),
          blueskyUrl: orNull(d.blueskyUrl),
          xUrl: orNull(d.xUrl),
          linkedinUrl: orNull(d.linkedinUrl),
          youtubeUrl: orNull(d.youtubeUrl),
          twitchUrl: orNull(d.twitchUrl),
          callForPapersUrl: orNull(d.callForPapersUrl),
        },
      };
    case 'podcast':
      return {
        kind: 'podcast',
        podcast: {
          name: d.name.trim(),
          url: d.url.trim(),
          logo: d.logo.trim(),
          language: d.language.trim(),
          description: d.description.trim(),
        },
      };
  }
}

/** The dataset's own rules, against what the hub already lists. */
export function issuesOf(submission: Submission, options: ContributeOptions): Issue[] {
  return validateSubmission(submission, {
    organizerIds: new Set(options.organizers.map((organizer) => organizer.value)),
    places: new Set(options.places),
    podcastNames: new Set(options.podcastNames),
  });
}

export function submissionJson(submission: Submission): string {
  return `${JSON.stringify(submission, null, 2)}\n`;
}

export function inboxPath(submission: Submission): string {
  return `${INBOX}/${submissionFileName(submission)}`;
}

/** GitHub's "new file" page with the entry filled in; committing it there proposes the pull request. */
export function pullRequestUrl(submission: Submission): string {
  const url = new URL(`https://github.com/${REPOSITORY}/new/${BRANCH}/${INBOX}`);
  url.searchParams.set('filename', submissionFileName(submission));
  url.searchParams.set('value', submissionJson(submission));
  return url.toString();
}
