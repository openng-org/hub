import { compareSemver, majorOf } from '@openng/core-angular-versions';

export { majorOf };
import { githubReleases, releases } from '@openng/data-releases';

import type { ReleaseChannel } from '../../app/features/releases/releases.model';

/** Majors with release insights, newest first. */
export const RELEASE_MAJORS: number[] = releases.map((release) => release.major);

export const LATEST_RELEASE_MAJOR = RELEASE_MAJORS[0]!;

export function isReleaseMajor(major: number): boolean {
  return RELEASE_MAJORS.includes(major);
}

export function channelOf(version: string): ReleaseChannel {
  if (/-next/i.test(version)) return 'next';
  if (/-rc/i.test(version)) return 'rc';
  return 'stable';
}

const CHANNEL_RANK: Record<ReleaseChannel, number> = { stable: 0, rc: 1, next: 2 };

/** Newest first: by X.Y.Z, then stable before rc before next, then by pre-release number. */
export function compareVersionsDesc(a: string, b: string): number {
  const core = compareSemver(b.split('-')[0]!, a.split('-')[0]!);
  if (core !== 0) return core;
  const rank = CHANNEL_RANK[channelOf(a)] - CHANNEL_RANK[channelOf(b)];
  if (rank !== 0) return rank;
  const pre = (v: string) => parseInt(/\.(\d+)$/.exec(v.split('-')[1] ?? '')?.[1] ?? '0', 10);
  return pre(b) - pre(a);
}

/** GitHub releases of a major (every repository, every channel). */
export function githubReleasesOf(major: number) {
  return githubReleases.filter((release) => majorOf(release.version) === major);
}
