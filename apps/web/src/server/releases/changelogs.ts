import type {
  ChangelogQuery,
  ChangelogRow,
  FilterOption,
  ReleaseChangelogs,
  ReleaseChannel,
} from '../../app/releases/data/api';
import { longDate } from '../community/dates';
import { memo } from '../memo';
import { channelOf, compareVersionsDesc, githubReleasesOf } from './versions';

const CHANNEL_LABELS: Record<ReleaseChannel, string> = {
  stable: 'Stable',
  rc: 'Release candidate',
  next: 'Next',
};

/** Repositories in display order. */
const REPOSITORIES = ['angular', 'angular-cli'];

/** One row per version, with a link to each repository's release notes; newest first. */
const rowsOf = memo((major: number): ChangelogRow[] => {
  const byVersion = new Map<string, { date: string; links: Map<string, string> }>();
  for (const release of githubReleasesOf(major)) {
    const entry = byVersion.get(release.version) ?? { date: release.releaseDate, links: new Map() };
    if (release.releaseDate < entry.date) entry.date = release.releaseDate;
    entry.links.set(release.repository, release.link);
    byVersion.set(release.version, entry);
  }
  return [...byVersion.entries()]
    .sort(([a], [b]) => compareVersionsDesc(a, b))
    .map(([version, { date, links }]) => {
      const channel = channelOf(version);
      return {
        version,
        channel,
        channelLabel: CHANNEL_LABELS[channel],
        date: longDate(date),
        links: [...links.entries()]
          .sort(([a], [b]) => {
            const rank = (repo: string) =>
              REPOSITORIES.includes(repo) ? REPOSITORIES.indexOf(repo) : REPOSITORIES.length;
            return rank(a) - rank(b) || a.localeCompare(b);
          })
          .map(([repository, url]) => ({ repository, url })),
      };
    });
});

export function countChangelogs(major: number): number {
  return rowsOf(major).filter((row) => row.channel === 'stable').length;
}

/** Release notes of a major; stable releases unless another channel (or "all") is asked for. */
export function listChangelogs(major: number, query: ChangelogQuery = {}): ReleaseChangelogs {
  const rows = rowsOf(major);
  const channel = query.channel || 'stable';
  const count = (key: ReleaseChannel) => rows.filter((row) => row.channel === key).length;
  const channels: FilterOption[] = [
    ...(['stable', 'rc', 'next'] as ReleaseChannel[])
      .filter((key) => count(key) > 0)
      .map((key) => ({ value: key, label: CHANNEL_LABELS[key], count: count(key) })),
    { value: 'all', label: 'All', count: rows.length },
  ];
  return {
    major,
    items: channel === 'all' ? rows : rows.filter((row) => row.channel === channel),
    channels,
  };
}
