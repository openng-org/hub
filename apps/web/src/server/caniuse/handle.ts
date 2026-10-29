import { int, segments } from '../query';
import * as api from './index';

/**
 * Resolves one API path (relative to /api/caniuse) and its query string to a view, or `null` when
 * nothing exists there. Mounted by server/api.ts, which Express serves over HTTP and SSR calls
 * in-process.
 */
export function handleCaniuse(path: string, query: URLSearchParams): unknown {
  const q = (name: string) => query.get(name) ?? '';
  const parts = segments(path);
  if (!parts) return null;
  const [resource, a, b] = parts;

  switch (resource) {
    case 'summary':
      return parts.length === 1 ? api.summary() : null;
    case 'counts':
      return parts.length === 1 ? api.tabCounts(q('search')) : null;
    case 'features':
      if (parts.length === 1) {
        return api.listFeatures({
          search: q('search'),
          package: q('package'),
          status: q('status'),
          page: int(query.get('page'), 1),
        });
      }
      return parts.length === 2 ? api.featureDetail(a!) : null;
    case 'migrations':
      if (parts.length === 1) return api.migrationTree(q('search'));
      if (parts.length === 3 && a === 'major') {
        const major = int(b, 0, 0);
        return api.migrationMajors().includes(major) ? api.migrationsForMajor(major) : null;
      }
      return parts.length === 3 ? api.migrationDetail(a!, b!) : null;
    case 'mcp':
      return parts.length === 1 ? api.listMcp(q('search')) : null;
    case 'eslint':
      return parts.length === 1 ? api.listEslint({ search: q('search'), type: q('type') }) : null;
    default:
      return null;
  }
}
