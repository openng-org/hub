import { organizers, podcasts } from '@openng/data-community';
import { commits } from '@openng/data-releases/commits';

import type { HomeStats } from '../app/pages/home-api';
import { summary } from './caniuse';
import { LATEST_RELEASE_MAJOR } from './releases/versions';
import { releaseTimeline } from './timeline';

const format = (value: number) => value.toLocaleString('en-US');

/**
 * The home page data: the scoreboard (what the hub tracks, each number linking to where it lives)
 * and the release timeline, whose support statuses depend on today.
 */
export async function homeStats(today?: string): Promise<HomeStats> {
  const { counts } = summary();
  return {
    stats: [
      {
        value: `v${LATEST_RELEASE_MAJOR}`,
        label: 'Latest Angular',
        link: ['/releases', String(LATEST_RELEASE_MAJOR)],
      },
      { value: format(counts.features), label: 'Features tracked', link: ['/caniuse'] },
      {
        value: format(counts.migrations),
        label: 'ng update migrations',
        link: ['/caniuse', 'update'],
      },
      {
        value: format(commits.length),
        label: 'Release commits',
        link: ['/releases', String(LATEST_RELEASE_MAJOR), 'commits'],
      },
      { value: format(organizers.length), label: 'Communities', link: ['/communities'] },
      { value: format(podcasts.length), label: 'Podcasts', link: ['/podcasts'] },
    ],
    timeline: releaseTimeline(today),
  };
}
