import {
  isReleaseMajor,
  listAllCommits,
  listChangelogs,
  listCommits,
  listEslintAdditions,
  listFeatureChanges,
  listGuides,
  listMcpAdditions,
  listUpdate,
  releaseIndex,
  releaseSummary,
} from './index';
import { releaseTimeline } from './timeline';
import { int, naturalNumber, segments } from '../query';

/**
 * Resolves one release-insights API path (relative to /api/releases) and its query string, or
 * `null`: `/` (the majors), `/commits` (every release's commits), `/timeline` (every major on one
 * axis, with today's support statuses), `/<major>` (summary),
 * `/<major>/<section>`.
 * Mounted by server/api.ts, which Express serves over HTTP and SSR calls in-process.
 */
export function handleReleases(path: string, query: URLSearchParams): unknown {
  const q = (name: string) => query.get(name) ?? '';
  const parts = segments(path);
  if (!parts) return null;
  const [majorParam, section, ...extra] = parts;
  if (majorParam === undefined) return releaseIndex();
  if (majorParam === 'timeline') return section === undefined ? releaseTimeline() : null;
  if (majorParam === 'commits') {
    if (section !== undefined) return null;
    // A major ("22") or a stable release ("22.1.3").
    if (q('version') && !/^\d+(\.\d+\.\d+)?$/.test(q('version'))) return null;
    return listAllCommits({
      search: q('search'),
      type: q('type'),
      package: q('package'),
      version: q('version'),
      page: int(query.get('page'), 1),
    });
  }
  const major = naturalNumber(majorParam);
  if (major === null || !isReleaseMajor(major) || extra.length > 0) return null;

  switch (section) {
    case undefined:
      return releaseSummary(major);
    case 'features':
      return listFeatureChanges(major, q('status'));
    case 'guide':
      return listGuides(major, {
        criticality: q('criticality'),
        difficulty: q('difficulty'),
        impact: q('impact'),
      });
    case 'update':
      return listUpdate(major);
    case 'commits':
      return listCommits(major, {
        search: q('search'),
        type: q('type'),
        package: q('package'),
        version: q('version'),
        page: int(query.get('page'), 1),
      });
    case 'mcp':
      return listMcpAdditions(major);
    case 'eslint':
      return listEslintAdditions(major);
    case 'changelogs':
      return listChangelogs(major, { channel: q('channel') });
    default:
      return null;
  }
}
