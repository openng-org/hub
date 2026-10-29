import { organizers, type Organizer } from '@openng/data-community';

/** The communities by id, for the views that join events to the group running them. */
export const organizerById: ReadonlyMap<string, Organizer> = new Map(
  organizers.map((organizer) => [organizer.id, organizer]),
);
