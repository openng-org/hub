import eventsData from '../data/events.json' with { type: 'json' };
import organizersData from '../data/organizers.json' with { type: 'json' };
import placesData from '../data/places.json' with { type: 'json' };
import podcastsData from '../data/podcasts.json' with { type: 'json' };

import type { CommunityEvent, Organizer, Podcast } from './models';

export type * from './models';

/** Every event ever listed, past and upcoming, in contribution order. */
export const events = eventsData as CommunityEvent[];
export const organizers = organizersData as Organizer[];
export const podcasts = podcastsData as Podcast[];
/** Coordinates of every on-site event location, `[latitude, longitude]`, keyed by `location`. */
export const places = placesData as unknown as Record<string, [number, number]>;
