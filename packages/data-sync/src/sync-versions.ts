import type { GitHub } from './github.ts';
import {
  compatibilityRows,
  mergeMajors,
  supportedMajors,
  type MajorRelease,
} from './lib/angular-docs.ts';
import { minorReleases } from './lib/versions.ts';
import { OUTPUTS, readJson, writeJson } from './output.ts';

const REFERENCE = 'adev/src/content/reference';

interface ReleaseInsight {
  major: number;
  announcementUrl: string | null;
  youtubeVideoId: string | null;
}

/**
 * core-angular-versions: the Angular majors with their release day and support windows
 * (majors.json), and the Node.js / TypeScript / RxJS ranges of each version (compatibility.json),
 * from angular.dev's reference pages and the x.0.0 releases. A new major also gets its Release
 * insights entry (data-releases/data/releases.json), announcement and video left to fill in.
 */
export async function syncVersions(github: GitHub): Promise<string[]> {
  const read = (page: string) =>
    github.raw('angular', 'main', `${REFERENCE}/${page}`, { immutable: false });
  const [releasesPage, versionsPage] = await Promise.all([
    read('releases.md'),
    read('versions.md'),
  ]);
  const supported = supportedMajors(releasesPage ?? '');
  const compatibility = compatibilityRows(versionsPage ?? '');
  // A page moved or reworded: better no update than a dataset emptied.
  if (supported.length === 0 || compatibility.length === 0) {
    throw new Error(
      `angular.dev's reference pages changed: check ${REFERENCE}/releases.md and versions.md`,
    );
  }

  const known = await readJson<MajorRelease[]>(OUTPUTS.majors);
  const newMajors = minorReleases(await github.tags('angular')).filter(
    ({ version }) =>
      version.minor === 0 && !known.some((release) => release.major === version.major),
  );
  const released = [];
  for (const { tag, version } of newMajors) {
    const release = await github.api<{ published_at: string | null; created_at: string }>(
      `/repos/angular/angular/releases/tags/${tag}`,
      { immutable: true },
    );
    const day = (release?.published_at ?? release?.created_at)?.slice(0, 10);
    if (day) released.push({ major: version.major, released: day });
  }
  const today = new Date().toISOString().slice(0, 10);
  const majors = mergeMajors(known, supported, released, today);

  const insights = await readJson<ReleaseInsight[]>(OUTPUTS.releaseInsights);
  const firstInsight = Math.min(...insights.map((insight) => insight.major));
  for (const { major } of majors) {
    if (major > firstInsight && !insights.some((insight) => insight.major === major)) {
      insights.push({ major, announcementUrl: null, youtubeVideoId: null });
    }
  }
  insights.sort((a, b) => b.major - a.major);

  return [
    `majors.json: ${await writeJson(OUTPUTS.majors, majors)} (latest: ${majors[0]?.major})`,
    `compatibility.json: ${await writeJson(OUTPUTS.compatibility, compatibility)} (${compatibility.length} rows)`,
    `releases.json: ${await writeJson(OUTPUTS.releaseInsights, insights)} (${insights.length} majors with insights)`,
  ];
}
