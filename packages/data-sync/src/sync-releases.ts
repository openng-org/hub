import type { GitHub } from './github.ts';
import type { Repository } from './lib/migrations.ts';
import { parseReleaseNotes } from './lib/release-notes.ts';
import { compareVersions, formatVersion, parseVersion, type Version } from './lib/versions.ts';
import { OUTPUTS, writeJson } from './output.ts';

/** The release notes list commits in a table since v14; older releases are not read. */
const FIRST_MAJOR = 14;
const REPOSITORIES: Repository[] = ['angular', 'angular-cli'];

interface ApiRelease {
  tag_name: string;
  html_url: string;
  draft: boolean;
  published_at: string | null;
  created_at: string;
  body: string | null;
}

interface Release {
  repository: Repository;
  version: Version;
  link: string;
  date: string;
  notes: string;
}

/**
 * data-releases: every GitHub release of angular/angular and angular/angular-cli since v14
 * (github-releases.json), and the commits listed in the notes of the stable ones (commits.json),
 * newest release first.
 */
export async function syncReleases(github: GitHub): Promise<string[]> {
  const releases = (await Promise.all(REPOSITORIES.map((repo) => releasesOf(github, repo)))).flat();
  releases.sort(
    (a, b) => compareVersions(b.version, a.version) || a.repository.localeCompare(b.repository),
  );

  const githubReleases = releases.map((release) => ({
    version: formatVersion(release.version),
    link: release.link,
    releaseDate: release.date,
    repository: release.repository,
  }));
  const commits = releases
    .filter((release) => release.version.pre === null)
    .flatMap((release) =>
      parseReleaseNotes(release.notes).map((commit) => ({
        sha: commit.sha,
        description: commit.description,
        version: formatVersion(release.version),
        type: commit.type,
        package: commit.package,
        repository: commit.repository,
      })),
    );

  return [
    `github-releases.json: ${await writeJson(OUTPUTS.githubReleases, githubReleases)} (${githubReleases.length} releases)`,
    `commits.json: ${await writeJson(OUTPUTS.commits, commits)} (${commits.length} commits)`,
  ];
}

async function releasesOf(github: GitHub, repository: Repository): Promise<Release[]> {
  const isRecent = (tag: string) => (parseVersion(tag)?.major ?? 0) >= FIRST_MAJOR;
  const found: ApiRelease[] = [];
  // Newest first: stop at the first page with nothing recent left.
  for await (const page of github.pages<ApiRelease>(
    `/repos/angular/${repository}/releases`,
    (page) => !page.some((release) => isRecent(release.tag_name)),
  )) {
    found.push(...page);
  }

  // A release can be missing from the list (15.0.0 was): look up the tags without one.
  const listed = new Set(found.map((release) => release.tag_name));
  for (const tag of await github.tags(repository)) {
    if (!isRecent(tag) || listed.has(tag)) continue;
    const release = await github.api<ApiRelease>(
      `/repos/angular/${repository}/releases/tags/${tag}`,
      { immutable: true },
    );
    if (release) found.push(release);
  }

  const byVersion = new Map<string, Release>();
  for (const release of found) {
    const version = parseVersion(release.tag_name);
    if (release.draft || !version || version.major < FIRST_MAJOR) continue;
    const key = formatVersion(version);
    if (byVersion.has(key)) continue;
    byVersion.set(key, {
      repository,
      version,
      link: release.html_url,
      date: release.published_at ?? release.created_at,
      notes: release.body ?? '',
    });
  }
  return [...byVersion.values()];
}
