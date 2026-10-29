import { int, oneOf, segments } from '../query';
import { listCommunities } from './communities';
import { contributeOptions } from './contribute';
import { listEvents } from './events';
import { eventMap } from './map';
import { listPodcasts } from './podcasts';

/**
 * Resolves one community API path (relative to /api/community) and its query string, or `null`.
 * Mounted by server/api.ts, which Express serves over HTTP and SSR calls in-process.
 */
export function handleCommunity(path: string, query: URLSearchParams): unknown {
  const q = (name: string) => query.get(name) ?? '';
  const when = oneOf(query.get('when'), ['upcoming', 'past'] as const, 'upcoming');
  switch (segments(path)?.join('/')) {
    case 'events':
      return listEvents({
        when,
        search: q('search'),
        type: q('type'),
        format: q('format'),
        page: int(query.get('page'), 1),
      });
    case 'events/map':
      return eventMap({ when, search: q('search'), type: q('type'), format: q('format') });
    case 'contribute':
      return contributeOptions();
    case 'communities':
      return listCommunities({ search: q('search'), country: q('country') });
    case 'podcasts':
      return listPodcasts();
    default:
      return null;
  }
}
