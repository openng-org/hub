import { podcasts } from '@openng/data-community';

import type { PodcastCard, PodcastList } from '../../app/community/data/api';
import { monthLabel } from './dates';

/** Podcasts still publishing first, then by name. */
export function listPodcasts(): PodcastList {
  const cards: PodcastCard[] = podcasts
    .map((podcast) => ({
      name: podcast.name,
      url: podcast.url,
      logo: podcast.logo,
      language: podcast.language,
      description: podcast.description,
      lastEpisode: podcast.lastActive ? `Last episode ${monthLabel(podcast.lastActive)}` : null,
    }))
    .sort(
      (a, b) => Number(!!a.lastEpisode) - Number(!!b.lastEpisode) || a.name.localeCompare(b.name),
    );
  return { items: cards };
}
