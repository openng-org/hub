import {
  isReleaseMajor,
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
import { int, naturalNumber, segments } from '../query';

/**
 * Resolves one release-insights API path (relative to /api/releases) and its query string, or
 * `null`: `/` (the majors), `/<major>` (summary), `/<major>/<section>`.
 * Mounted by server/api.ts, which Express serves over HTTP and SSR calls in-process.
 */
export function handleReleases(path: string, query: URLSearchParams): unknown {
  const q = (name: string) => query.get(name) ?? '';
  const parts = segments(path);
  if (!parts) return null;
  const [majorParam, section, ...extra] = parts;
  if (majorParam === undefined) return releaseIndex();
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
