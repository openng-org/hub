/**
 * The rules an entry must follow, shared by the dataset tests, the inbox merge script and the
 * "Add to the hub" form on the site — one definition, so a form that passes builds a PR that passes.
 * Framework-free and data-free (`@openng/data-community/validate` does not pull the datasets in).
 */
import type { CommunityEvent, EventType, Organizer, Podcast } from './models';

export interface Issue {
  /** The field the message is about ('' for the whole entry). */
  field: string;
  message: string;
}

/** What the rules need to know about the existing data. */
export interface ValidationContext {
  organizerIds: ReadonlySet<string>;
  /** Locations that already have coordinates (data/places.json). */
  places: ReadonlySet<string>;
  podcastNames: ReadonlySet<string>;
}

/**
 * One contribution, as the form writes it to `data/inbox/<file>.json` and the merge script adds it
 * to the dataset. `place` gives the coordinates of a location that has none yet.
 */
export type Submission =
  | { kind: 'event'; event: CommunityEvent; place?: [number, number] }
  | { kind: 'community'; community: Organizer }
  | { kind: 'podcast'; podcast: Podcast };

export const EVENT_TYPES: readonly EventType[] = ['conference', 'meetup', 'workshop', 'other'];

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** ISO 4217 ("EUR", "USD"): the site turns it into a symbol. */
const CURRENCY = /^[A-Z]{3}$/;
const isHttpUrl = (value: string) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value);
const isLogo = (value: string) => isHttpUrl(value) || /^\/logos\/[\w.-]+$/.test(value);

/** "NG Paris 2026!" → "ng-paris-2026". */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function check(issues: Issue[], ok: boolean, field: string, message: string): void {
  if (!ok) issues.push({ field, message });
}

function optionalUrl(issues: Issue[], value: string | null | undefined, field: string): void {
  if (value) check(issues, isHttpUrl(value), field, 'Must be a full http(s) URL.');
}

/**
 * The rules of an event. A contribution (`isNew`) needs a name; the dataset also holds recurring
 * meetups without one, shown under their community's name.
 */
export function validateEvent(
  event: CommunityEvent,
  context: Pick<ValidationContext, 'organizerIds'>,
  { isNew = false } = {},
): Issue[] {
  const issues: Issue[] = [];
  if (isNew || event.name !== null) {
    check(issues, !!event.name?.trim(), 'name', 'Give the event a name.');
  }
  check(
    issues,
    context.organizerIds.has(event.organizerId),
    'organizerId',
    'Pick the community organizing it (add the community first if it is not listed).',
  );
  check(issues, EVENT_TYPES.includes(event.type), 'type', 'Pick a type.');
  check(
    issues,
    ISO_DAY.test(event.date),
    'date',
    event.date ? 'Use a YYYY-MM-DD date.' : 'When does it start?',
  );
  if (event.endDate) {
    check(issues, ISO_DAY.test(event.endDate), 'endDate', 'Use a YYYY-MM-DD date.');
    check(issues, event.endDate >= event.date, 'endDate', 'The end is before the start.');
  }
  check(issues, event.isOnsite || event.isRemote, 'format', 'On site, online, or both.');
  if (event.isOnsite) {
    check(issues, !!event.location?.trim(), 'location', 'Where is it? "City, Country".');
  }
  check(issues, !!event.language?.trim(), 'language', 'Which language is it in?');
  optionalUrl(issues, event.url, 'url');
  optionalUrl(issues, event.callForPapersUrl, 'callForPapersUrl');
  if (event.callForPapersDueDate) {
    check(
      issues,
      ISO_DAY.test(event.callForPapersDueDate),
      'callForPapersDueDate',
      'Use a YYYY-MM-DD date.',
    );
  }
  if (event.startingPrice != null) {
    check(issues, event.startingPrice > 0, 'startingPrice', 'A price above 0, or mark it free.');
    check(issues, !event.isFree, 'startingPrice', 'A free event has no price.');
  }
  if (event.currency) {
    check(issues, CURRENCY.test(event.currency), 'currency', 'A currency code such as EUR or USD.');
  }
  return issues;
}

export function validateOrganizer(
  organizer: Organizer,
  context: Pick<ValidationContext, 'organizerIds'>,
  { isNew = false } = {},
): Issue[] {
  const issues: Issue[] = [];
  check(issues, !!organizer.name?.trim(), 'name', 'Give the community a name.');
  check(issues, SLUG.test(organizer.id), 'id', 'Lowercase letters, digits and dashes only.');
  if (isNew) {
    check(issues, !context.organizerIds.has(organizer.id), 'id', 'This id is already taken.');
  }
  if (organizer.logo) check(issues, isLogo(organizer.logo), 'logo', 'A full image URL.');
  for (const key of [
    'websiteUrl',
    'eventsUrl',
    'organizersUrl',
    'blueskyUrl',
    'xUrl',
    'linkedinUrl',
    'youtubeUrl',
    'twitchUrl',
    'callForPapersUrl',
  ] as const) {
    optionalUrl(issues, organizer[key], key);
  }
  check(
    issues,
    !!(
      organizer.websiteUrl ||
      organizer.eventsUrl ||
      organizer.linkedinUrl ||
      organizer.xUrl ||
      organizer.blueskyUrl ||
      organizer.youtubeUrl
    ),
    'websiteUrl',
    'Give at least one link: a website, an events page or a social profile.',
  );
  return issues;
}

export function validatePodcast(
  podcast: Podcast,
  context: Pick<ValidationContext, 'podcastNames'>,
  { isNew = false } = {},
): Issue[] {
  const issues: Issue[] = [];
  check(issues, !!podcast.name?.trim(), 'name', 'Give the podcast a name.');
  if (isNew) {
    check(
      issues,
      !context.podcastNames.has(podcast.name),
      'name',
      'This podcast is already listed.',
    );
  }
  check(issues, !!podcast.url && isHttpUrl(podcast.url), 'url', 'A full http(s) URL.');
  check(issues, !!podcast.logo && isLogo(podcast.logo), 'logo', 'A full image URL.');
  check(issues, !!podcast.language?.trim(), 'language', 'Which language is it in?');
  check(issues, !!podcast.description?.trim(), 'description', 'One or two sentences.');
  return issues;
}

/** Everything a new contribution must satisfy before it can be merged into the dataset. */
export function validateSubmission(submission: Submission, context: ValidationContext): Issue[] {
  switch (submission.kind) {
    case 'event': {
      const issues = validateEvent(submission.event, context, { isNew: true });
      const location = submission.event.location;
      if (submission.event.isOnsite && location && !context.places.has(location)) {
        const place = submission.place;
        check(
          issues,
          !!place && place.length === 2 && Math.abs(place[0]) <= 90 && Math.abs(place[1]) <= 180,
          'place',
          'New city: give its latitude and longitude for the map.',
        );
      }
      return issues;
    }
    case 'community':
      return validateOrganizer(submission.community, context, { isNew: true });
    case 'podcast':
      return validatePodcast(submission.podcast, context, { isNew: true });
    default:
      return [{ field: '', message: 'Unknown kind of submission.' }];
  }
}

/** The inbox file name of a submission: "event-2026-11-12-ng-paris.json". */
export function submissionFileName(submission: Submission): string {
  switch (submission.kind) {
    case 'event':
      return `event-${submission.event.date}-${slugify(submission.event.name ?? 'event') || 'event'}.json`;
    case 'community':
      return `community-${submission.community.id || 'new'}.json`;
    case 'podcast':
      return `podcast-${slugify(submission.podcast.name) || 'new'}.json`;
  }
}
