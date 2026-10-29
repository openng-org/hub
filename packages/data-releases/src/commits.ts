import commitsData from '../data/commits.json' with { type: 'json' };

import type { ReleaseCommit } from './models';

/**
 * Commits of every stable release, newest release first. ~1.5 MB: its own entry
 * (`@openng/data-releases/commits`), so a consumer that only wants the releases does not load it.
 */
export const commits = commitsData as ReleaseCommit[];

/** The commit on GitHub. */
export function commitUrl(commit: Pick<ReleaseCommit, 'repository' | 'sha'>): string {
  return `https://github.com/angular/${commit.repository}/commit/${commit.sha}`;
}
