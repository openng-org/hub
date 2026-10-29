import { int, segments } from '../query';
import { isLibraryCategory, isLibrarySort, libraryDetail, listLibraries } from './index';

/**
 * Resolves one library-health API path (relative to /api/libraries) and its query string, or
 * `null`: `/` (the list, filtered) and `/<name>` or `/<scope>/<name>` (one library).
 * Mounted by server/api.ts, which Express serves over HTTP and SSR calls in-process.
 */
export function handleLibraries(path: string, query: URLSearchParams): unknown {
  const q = (name: string) => query.get(name) ?? '';
  const parts = segments(path);
  if (!parts) return null;
  if (parts.length === 0) {
    const category = q('category');
    const sort = q('sort');
    return listLibraries({
      search: q('search'),
      category: isLibraryCategory(category) ? category : '',
      major: /^\d+$/.test(q('major')) ? q('major') : '',
      sort: isLibrarySort(sort) ? sort : 'score',
      page: int(query.get('page'), 1),
    });
  }
  return parts.length <= 2 ? libraryDetail(parts.join('/')) : null;
}
