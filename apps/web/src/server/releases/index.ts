import { releases } from '@openng/data-releases';

import type {
  ReleaseIndex,
  ReleaseSection,
  ReleaseSectionId,
  ReleaseSummary,
} from '../../app/features/releases/releases.model';
import { longDate } from '../community/dates';
import { articleJsonLd } from '../seo';
import { listEslintAdditions, listMcpAdditions, listUpdate } from './catalog';
import { countChangelogs } from './changelogs';
import { countCommits } from './commits';
import { countFeatureChanges } from './features';
import { countGuideChanges } from './guide';
import {
  channelOf,
  compareVersionsDesc,
  githubReleasesOf,
  isReleaseMajor,
  LATEST_RELEASE_MAJOR,
  RELEASE_MAJORS,
} from './versions';

export { listEslintAdditions, listMcpAdditions, listUpdate } from './catalog';
export { listChangelogs } from './changelogs';
export { listAllCommits, listCommits } from './commits';
export { listFeatureChanges } from './features';
export { listGuides } from './guide';
export { isReleaseMajor, RELEASE_MAJORS } from './versions';

/** Sections in navigation order. */
const SECTIONS: Omit<ReleaseSection, 'count' | 'path'>[] = [
  { id: 'overview', label: 'Overview', icon: 'pi pi-home', description: 'The release at a glance' },
  {
    id: 'features',
    label: 'Features',
    icon: 'pi pi-flask',
    description: 'Features that changed stage',
  },
  {
    id: 'guide',
    label: 'Migration guide',
    icon: 'pi pi-directions',
    description: 'What to check when updating, most critical first',
  },
  {
    id: 'update',
    label: 'NG Update',
    icon: 'pi pi-sync',
    description: 'Migrations ng update runs for you',
  },
  {
    id: 'commits',
    label: 'Commits',
    icon: 'pi pi-code',
    description: 'Every commit of the stable releases',
  },
  {
    id: 'mcp',
    label: 'MCP server',
    icon: 'pi pi-sparkles',
    description: 'New tools and resources of the MCP server',
  },
  {
    id: 'eslint',
    label: 'ESLint rules',
    icon: 'pi pi-check-square',
    description: 'New angular-eslint rules',
  },
  {
    id: 'changelogs',
    label: 'Changelogs',
    icon: 'pi pi-list',
    description: 'Release notes on GitHub',
  },
];

/**
 * Sections left out of the navigation and the prerender (so out of the sitemap) for now; their page
 * and API still answer when visited directly. Remove an id to bring the section back.
 *
 * TODO(migration-guide): the migration guide is hidden until it is ready to ship (only the 22.1
 * guide is written, in packages/data-releases/src/migration-guides). To bring it back: remove
 * 'guide' here, drop the `releases/:version/guide` server route in app/app.routes.server.ts, restore
 * the "Migration guide" entry of the Releases menu in app/layout/nav.ts, and mention the guide again
 * in the release descriptions (app/releases/pages/release-layout.ts and releaseSummary's JSON-LD).
 */
const HIDDEN_SECTIONS = new Set<ReleaseSectionId>(['guide']);
const LISTED_SECTIONS = SECTIONS.filter((section) => !HIDDEN_SECTIONS.has(section.id));

/** The sections shown and prerendered, in navigation order. */
export const RELEASE_SECTION_IDS: ReleaseSectionId[] = LISTED_SECTIONS.map((section) => section.id);

export function releaseIndex(): ReleaseIndex {
  return { majors: RELEASE_MAJORS, latest: LATEST_RELEASE_MAJOR };
}

async function counts(major: number): Promise<Record<ReleaseSectionId, number | null>> {
  return {
    overview: null,
    features: await countFeatureChanges(major),
    guide: countGuideChanges(major),
    update: listUpdate(major).items.length,
    commits: countCommits(major),
    mcp: listMcpAdditions(major).items.length,
    eslint: listEslintAdditions(major).items.length,
    changelogs: countChangelogs(major),
  };
}

export async function releaseSummary(major: number): Promise<ReleaseSummary | null> {
  if (!isReleaseMajor(major)) return null;
  const release = releases.find((entry) => entry.major === major)!;
  const github = githubReleasesOf(major);
  const first = github.find(
    (entry) => entry.version === `${major}.0.0` && entry.repository === 'angular',
  );
  const latestVersion =
    github
      .map((entry) => entry.version)
      .filter((version) => channelOf(version) === 'stable')
      .sort(compareVersionsDesc)[0] ?? null;
  const sectionCounts = await counts(major);

  return {
    major,
    majors: RELEASE_MAJORS,
    released: first ? `Released ${longDate(first.releaseDate)}` : null,
    latestVersion,
    youtubeVideoId: release.youtubeVideoId,
    resources: [
      ...(release.announcementUrl
        ? [{ label: 'Announcement', icon: 'pi pi-megaphone', url: release.announcementUrl }]
        : []),
      {
        label: 'Update guide',
        icon: 'pi pi-map',
        url: `https://angular.dev/update-guide?v=${major - 1}.0-${major}.0&l=1`,
      },
      {
        label: 'Documentation',
        icon: 'pi pi-book',
        url:
          major === LATEST_RELEASE_MAJOR
            ? 'https://angular.dev/'
            : `https://v${major}.angular.dev/`,
      },
    ],
    jsonLd: articleJsonLd({
      headline: `What's new in Angular ${major}`,
      description: `Angular ${major} release insights: features that changed stage, ng update migrations, commits and changelogs.`,
      path: `/releases/${major}`,
      about: `Angular ${major}`,
      image: `/og/releases/${major}.png`,
    }),
    sections: LISTED_SECTIONS.map((section) => ({
      ...section,
      count: sectionCounts[section.id],
      path:
        section.id === 'overview'
          ? ['/releases', String(major)]
          : ['/releases', String(major), section.id],
    })),
  };
}
