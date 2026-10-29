/**
 * The site-wide search: one index over every dataset (Can I Use features, ng update migrations,
 * MCP tools, ESLint rules, releases, events, communities, podcasts) and the hub's own pages. Each
 * entry knows the page where it can be found, so the palette can take the visitor there.
 *
 * The static part is built once; events depend on today (upcoming or past), so their entries are
 * rebuilt per day. Matching is accent- and case-insensitive; every word of the query must appear.
 */
import { events, organizers, podcasts } from '@openng/data-community';

import type {
  SearchGroup,
  SearchKind,
  SearchLink,
  SearchResult,
  SearchResults,
} from '../app/core/search/search-api';
import { featureRows, listEslint, listMcp, migrationRefs } from './caniuse/index';
import { libraryRefs } from './libraries/index';
import { dateRange, todayIso } from './community/dates';
import { lastDay } from './community/events';
import { organizerById } from './community/organizers';
import { RELEASE_MAJORS } from './releases/versions';

/** Results per group; the group links to its full list when there are more. */
export const SEARCH_GROUP_LIMIT = 5;
/** Queries are cut there: nobody types more, and it bounds the work per request. */
const MAX_QUERY_LENGTH = 80;

interface Entry extends SearchResult {
  /** Normalized title, then everything else worth matching (description, package, place…). */
  name: string;
  text: string;
  /** Tie-breaker within a kind: lower first (upcoming events before past ones, newest major…). */
  rank: number;
}

const GROUPS: Record<SearchKind, { label: string; icon: string }> = {
  page: { label: 'Pages', icon: 'pi pi-compass' },
  feature: { label: 'Features', icon: 'pi pi-flask' },
  migration: { label: 'ng update migrations', icon: 'pi pi-sync' },
  mcp: { label: 'MCP server', icon: 'pi pi-sparkles' },
  eslint: { label: 'ESLint rules', icon: 'pi pi-check-square' },
  library: { label: 'Libraries', icon: 'pi pi-box' },
  release: { label: 'Releases', icon: 'pi pi-megaphone' },
  event: { label: 'Events', icon: 'pi pi-calendar' },
  community: { label: 'Communities', icon: 'pi pi-users' },
  podcast: { label: 'Podcasts', icon: 'pi pi-microphone' },
};
const GROUP_ORDER = Object.keys(GROUPS) as SearchKind[];

/** "Signal Forms" → "signal forms", "Zürich" → "zurich". */
export function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function entry(
  kind: SearchKind,
  title: string,
  where: string,
  link: SearchLink,
  options: {
    subtitle?: string | null;
    /** False when the subtitle is only shown, never matched (an MCP item's type). */
    searchSubtitle?: boolean;
    keywords?: (string | null | undefined)[];
    rank?: number;
  } = {},
): Entry {
  const subtitle = options.subtitle ?? null;
  return {
    kind,
    title,
    subtitle,
    where,
    link,
    name: normalize(title),
    text: normalize(
      [options.searchSubtitle === false ? null : subtitle, ...(options.keywords ?? [])]
        .filter(Boolean)
        .join(' '),
    ),
    rank: options.rank ?? 0,
  };
}

/**
 * The hub's own pages, findable by what they are about. Keep keywords specific: a word that is also
 * an Angular API ("resource", "signal") makes the page show up in searches for that API.
 */
function pageEntries(): Entry[] {
  const latest = RELEASE_MAJORS[0]!;
  const page = (title: string, path: string[], keywords: string[]) =>
    entry('page', title, 'Angular Hub', { path }, { keywords });
  return [
    page('Home', ['/'], ['start', 'release timeline', 'support', 'lts', 'end of life']),
    page('Events', ['/events'], ['conferences', 'meetups', 'workshops', 'calendar', 'rss', 'map']),
    page('Communities', ['/communities'], ['meetups', 'user groups', 'speak', 'call for papers']),
    page('Podcasts', ['/podcasts'], ['listen', 'shows', 'episodes']),
    page('Add to the hub', ['/contribute'], ['contribute', 'add', 'event', 'community', 'podcast']),
    page('Can I Use', ['/caniuse'], ['features', 'status', 'stable', 'experimental', 'deprecated']),
    page('NG Update', ['/caniuse', 'update'], ['migrations', 'schematics', 'ng update', 'upgrade']),
    page('MCP server', ['/caniuse', 'mcp'], ['ai', 'tools', 'agents', 'llm']),
    page('ESLint rules', ['/caniuse', 'eslint'], ['lint', 'angular-eslint', 'rules']),
    page(`What's new in Angular ${latest}`, ['/releases', String(latest)], ['release', 'news']),
    page('Commit search', ['/releases', 'commits'], ['commits', 'changelog', 'git', 'when landed']),
    page(
      'Library health',
      ['/libraries'],
      ['libraries', 'packages', 'health score', 'compatibility', 'npm'],
    ),
    page('About', ['/about'], ['why', 'gerome', 'open source', 'mission']),
  ];
}

const caniuse = (tab: string) => `Can I Use · ${tab}`;

function staticEntries(): Entry[] {
  return [
    ...pageEntries(),
    ...featureRows().map((row) =>
      entry(
        'feature',
        row.name,
        caniuse('Features'),
        // The list, filtered down to this feature (name, and its package when it has one).
        {
          path: ['/caniuse'],
          queryParams: { search: row.name, ...(row.package ? { package: row.package } : {}) },
        },
        {
          subtitle: row.package,
          keywords: [row.description, row.latest?.status],
        },
      ),
    ),
    ...migrationRefs().map((ref) =>
      entry(
        'migration',
        ref.name,
        caniuse('NG Update'),
        { path: ref.path },
        {
          subtitle: ref.repository === 'angular-cli' ? '@angular/cli' : '@angular/core',
          keywords: [ref.description],
        },
      ),
    ),
    ...listMcp().items.map((tool) =>
      entry(
        'mcp',
        tool.name,
        caniuse('MCP'),
        {
          path: ['/caniuse', 'mcp'],
          queryParams: { search: tool.name },
        },
        // The type (tool, resource…) is shown but not searched: "resource" means the Angular API.
        { subtitle: tool.type, searchSubtitle: false, keywords: [tool.description] },
      ),
    ),
    ...listEslint().items.map((rule) =>
      entry(
        'eslint',
        rule.name,
        caniuse('ESLint'),
        {
          path: ['/caniuse', 'eslint'],
          queryParams: { search: rule.name },
        },
        { subtitle: `${rule.typeLabel} · since ${rule.version}`, keywords: [rule.description] },
      ),
    ),
    ...libraryRefs().map((library) =>
      entry(
        'library',
        library.name,
        'Library health',
        { path: library.path },
        { subtitle: library.description, keywords: ['library', 'package', 'health'] },
      ),
    ),
    ...RELEASE_MAJORS.map((major, index) =>
      entry(
        'release',
        `Angular ${major}`,
        'Release insights',
        {
          path: ['/releases', String(major)],
        },
        {
          subtitle: 'Features, ng update, commits, changelogs',
          keywords: [`v${major}`],
          rank: index,
        },
      ),
    ),
    ...organizers.map((organizer) =>
      entry(
        'community',
        organizer.name,
        'Communities',
        {
          path: ['/communities'],
          queryParams: { search: organizer.name },
        },
        { subtitle: organizer.location ?? 'Online', keywords: [organizer.id] },
      ),
    ),
    ...podcasts.map((podcast) =>
      entry(
        'podcast',
        podcast.name,
        'Podcasts',
        { href: podcast.url },
        {
          subtitle: podcast.language,
          keywords: [podcast.description],
        },
      ),
    ),
  ];
}

/** Upcoming events first (soonest first), then past ones (newest first). */
function eventEntries(today: string): Entry[] {
  return events.map((event) => {
    const past = lastDay(event) < today;
    const organizer = organizerById.get(event.organizerId);
    const title = event.name ?? organizer?.name ?? 'Angular event';
    const days = Date.parse(event.date) / 86_400_000;
    return entry(
      'event',
      title,
      past ? 'Events · past' : 'Events',
      {
        path: ['/events'],
        queryParams: { search: title, ...(past ? { when: 'past' } : {}) },
      },
      {
        subtitle: `${dateRange(event.date, event.endDate)} · ${event.location ?? 'Online'}`,
        keywords: [organizer?.name, event.type, event.description],
        rank: past ? 1e6 - days : days,
      },
    );
  });
}

let staticIndex: Entry[] | null = null;
let eventIndex: { day: string; entries: Entry[] } | null = null;

function index(today: string): Entry[] {
  staticIndex ??= staticEntries();
  if (eventIndex?.day !== today) eventIndex = { day: today, entries: eventEntries(today) };
  return [...staticIndex, ...eventIndex.entries];
}

/** How well an entry matches: 0 = not at all; title matches beat description matches. */
function score(item: Entry, query: string, words: string[]): number {
  const all = `${item.name} ${item.text}`;
  if (!words.every((word) => all.includes(word))) return 0;
  // "resource" is an exact match for "resource()".
  if (item.name === query || item.name.replace(/\(\)$/, '') === query) return 100;
  if (item.name.startsWith(query)) return 80;
  if (item.name.split(/[\s\-_/.@()]+/).some((part) => part.startsWith(query))) return 60;
  if (item.name.includes(query)) return 50;
  if (words.every((word) => item.name.includes(word))) return 40;
  return 10;
}

/** The list page with the search applied, for "See all" (past events when the best hit is past). */
function moreLink(kind: SearchKind, query: string, top: Entry): SearchLink | null {
  const search = { search: query };
  switch (kind) {
    case 'feature':
      return { path: ['/caniuse'], queryParams: search };
    case 'migration':
      return { path: ['/caniuse', 'update'], queryParams: search };
    case 'mcp':
      return { path: ['/caniuse', 'mcp'], queryParams: search };
    case 'eslint':
      return { path: ['/caniuse', 'eslint'], queryParams: search };
    case 'library':
      return { path: ['/libraries'], queryParams: search };
    case 'event': {
      const past = 'path' in top.link && top.link.queryParams?.['when'] === 'past';
      return { path: ['/events'], queryParams: past ? { ...search, when: 'past' } : search };
    }
    case 'community':
      return { path: ['/communities'], queryParams: search };
    default:
      return null;
  }
}

export function search(rawQuery: string, today = todayIso()): SearchResults {
  const query = normalize(rawQuery.slice(0, MAX_QUERY_LENGTH));
  if (query.length < 2) return { query, groups: [], total: 0 };
  const words = query.split(' ');

  const found = new Map<SearchKind, { item: Entry; score: number }[]>();
  for (const item of index(today)) {
    const s = score(item, query, words);
    if (s > 0) found.set(item.kind, [...(found.get(item.kind) ?? []), { item, score: s }]);
  }

  const groups: SearchGroup[] = GROUP_ORDER.flatMap((kind) => {
    const hits = found.get(kind);
    if (!hits) return [];
    hits.sort(
      (a, b) =>
        b.score - a.score || a.item.rank - b.item.rank || a.item.title.localeCompare(b.item.title),
    );
    return [
      {
        kind,
        ...GROUPS[kind],
        items: hits.slice(0, SEARCH_GROUP_LIMIT).map(({ item }) => ({
          kind: item.kind,
          title: item.title,
          subtitle: item.subtitle,
          where: item.where,
          link: item.link,
        })),
        total: hits.length,
        more:
          hits.length > SEARCH_GROUP_LIMIT ? moreLink(kind, rawQuery.trim(), hits[0]!.item) : null,
      },
    ];
  });

  // The best match leads: groups are ordered by their top score, then by the usual order.
  const best = (group: SearchGroup) => Math.max(...found.get(group.kind)!.map((hit) => hit.score));
  groups.sort(
    (a, b) => best(b) - best(a) || GROUP_ORDER.indexOf(a.kind) - GROUP_ORDER.indexOf(b.kind),
  );

  return { query, groups, total: groups.reduce((sum, group) => sum + group.total, 0) };
}
