import githubReleasesData from '../data/github-releases.json' with { type: 'json' };
import releasesData from '../data/releases.json' with { type: 'json' };

import type { GithubRelease, Release } from './models';

export type * from './models';
export * from './migration-guides';

/** Majors with release insights, newest first. */
export const releases = releasesData as Release[];
/** GitHub releases (stable and pre-releases), newest first. */
export const githubReleases = githubReleasesData as GithubRelease[];
