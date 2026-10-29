import { events, organizers, places, podcasts } from '@openng/data-community';

import type { ContributeOptions } from '../../app/features/community/community.model';

/** The existing data the contribution form checks against and suggests from. */
export function contributeOptions(): ContributeOptions {
  const languages = new Map<string, number>();
  for (const { language } of [...events, ...podcasts]) {
    languages.set(language, (languages.get(language) ?? 0) + 1);
  }
  return {
    organizers: organizers
      .map((organizer) => ({ value: organizer.id, label: organizer.name }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    places: Object.keys(places).sort((a, b) => a.localeCompare(b)),
    podcastNames: podcasts.map((podcast) => podcast.name),
    languages: [...languages.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([language]) => language),
  };
}
