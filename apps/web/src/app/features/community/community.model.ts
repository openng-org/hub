/**
 * The community API contract (events, communities, podcasts): what the server sends, shaped for
 * the UI as it renders it. Types only; built in apps/web/src/server/community/.
 */

export type EventType = 'workshop' | 'conference' | 'meetup' | 'other';
export type EventFormat = 'online' | 'in-person' | 'hybrid';
export type EventWhen = 'upcoming' | 'past';

export interface OrganizerRef {
  id: string;
  name: string;
  logo: string | null;
}

/** An event, with every label the agenda shows. */
export interface EventCard {
  key: string;
  name: string;
  url: string | null;
  type: EventType;
  typeLabel: string;
  format: EventFormat;
  formatLabel: string;
  organizer: OrganizerRef | null;
  /** "City, Country", or "Online". */
  place: string;
  language: string;
  /** "Free", "From 199 €", or null when unknown. */
  price: string | null;
  /** The calendar tile: "NOV", "12", "THU". */
  tile: { month: string; day: string; weekday: string };
  /** "Thu 12 Nov 2026", or "12 – 14 Nov 2026" for multi-day events. */
  dates: string;
  /** "Today", "Tomorrow", "In 12 days", "3 weeks ago"… */
  relative: string;
  /** Open call for papers, when there is one. */
  cfp: { url: string; due: string | null } | null;
  description: string | null;
}

export interface EventMonth {
  key: string;
  /** "November 2026" */
  label: string;
  events: EventCard[];
}

export interface EventQuery {
  when?: EventWhen;
  search?: string;
  type?: string;
  format?: string;
  /** 1-based (past events are paged). */
  page?: number;
}

export interface EventList {
  when: EventWhen;
  months: EventMonth[];
  /** Events matching the query, across all pages. */
  total: number;
  page: number;
  pageCount: number;
  /** schema.org ItemList of the upcoming events of this page (null for past events). */
  jsonLd: object | null;
}

// --- Events map ---------------------------------------------------------------------------------

/** A location with its on-site events; x, y in map units (1 unit = 1°, see ui/world-land.ts). */
export interface MapPlace {
  key: string;
  /** "Paris, France" */
  label: string;
  x: number;
  y: number;
  /** Region value (see MapRegion), "world" when none fits. */
  region: string;
  count: number;
  /** Marker size multiplier: 1, 1.4 or 1.8 with the number of events. */
  scale: number;
  events: EventCard[];
}

export interface MapRegion {
  /** '' for the whole world. */
  value: string;
  label: string;
  /** On-site events in the region. */
  count: number;
  /** viewBox of the region: x, y, width, height. */
  view: [number, number, number, number];
  /** Marker side in map units at this zoom. */
  markerSize: number;
}

export interface EventMap {
  when: EventWhen;
  /** Busiest last (drawn on top). */
  places: MapPlace[];
  /** Events with a place on the map. */
  onMap: number;
  /** Online-only events, which have no place on the map. */
  online: number;
  regions: MapRegion[];
}

// --- Contribute -------------------------------------------------------------------------------

/** What the "Add to the hub" form needs to know about the existing data. */
export interface ContributeOptions {
  /** Communities an event can belong to: value = organizer id. */
  organizers: { value: string; label: string }[];
  /** Locations that already have coordinates on the map. */
  places: string[];
  podcastNames: string[];
  /** Languages already in use, most used first (suggestions). */
  languages: string[];
}

// --- Communities --------------------------------------------------------------------------------

export interface CommunityLink {
  label: string;
  /** `pi pi-*` icon class. */
  icon: string;
  url: string;
}

export interface CommunityCard {
  id: string;
  name: string;
  location: string | null;
  country: string;
  logo: string | null;
  /** Where the card leads: the website, else the events page, else the first link. */
  url: string | null;
  links: CommunityLink[];
  /** Their next upcoming event. */
  next: { name: string; dates: string; relative: string; url: string | null } | null;
  /** Events listed on the hub, past and upcoming. */
  eventCount: number;
  callForPapersUrl: string | null;
}

export interface CommunityQuery {
  search?: string;
  country?: string;
}

export interface CommunityList {
  items: CommunityCard[];
  /** Matching the filters. */
  total: number;
  /** Filter chips: every country with its number of communities, most first. */
  countries: { name: string; count: number }[];
}

// --- Podcasts -----------------------------------------------------------------------------------

export interface PodcastCard {
  name: string;
  url: string;
  logo: string;
  language: string;
  description: string;
  /** "Last episode Jan 2025" when the show stopped publishing, else null. */
  lastEpisode: string | null;
}

export interface PodcastList {
  items: PodcastCard[];
}

/** The events map grid: 1 unit = 1°, x = longitude + 180, y = WORLD_LAT_TOP - latitude. */
export const WORLD_WIDTH = 360;
export const WORLD_HEIGHT = 136;
export const WORLD_LAT_TOP = 78;
