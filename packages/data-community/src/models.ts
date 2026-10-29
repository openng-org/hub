export type EventType = 'workshop' | 'conference' | 'meetup' | 'other';

/** One event, as contributed in data/events.json. */
export interface CommunityEvent {
  name: string | null;
  /** `id` of the organizer in data/organizers.json. */
  organizerId: string;
  type: EventType;
  /** "City, Country", or null for online-only events. */
  location: string | null;
  /** First day, ISO "YYYY-MM-DD". */
  date: string;
  /** Last day for multi-day events, ISO "YYYY-MM-DD". */
  endDate?: string;
  language: string;
  isFree: boolean;
  isRemote: boolean;
  isOnsite: boolean;
  url: string | null;
  callForPapersUrl: string | null;
  callForPapersDueDate: string | null;
  description?: string | null;
  startingPrice?: number | null;
  currency?: string | null;
  toBeAnnounced?: boolean;
  isSoldOut?: boolean;
  attendeesCount?: number | null;
}

/** A community organizing events, as contributed in data/organizers.json. */
export interface Organizer {
  id: string;
  name: string;
  location: string | null;
  /** Absolute URL, or a path under the site's public folder ("/logos/x.webp"). */
  logo: string | null;
  eventsUrl: string | null;
  websiteUrl: string | null;
  organizersUrl: string | null;
  blueskyUrl: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  twitchUrl: string | null;
  callForPapersUrl: string | null;
}

export interface Podcast {
  name: string;
  url: string;
  logo: string;
  language: string;
  description: string;
  /** Month of the latest episode ("YYYY-MM"), when the podcast is no longer active. */
  lastActive?: string;
}
