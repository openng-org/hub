import { handleCaniuse } from './caniuse/handle';
import { handleCommunity } from './community/handle';
import { homeStats } from './home';
import { handleReleases } from './releases/handle';

/** What answers an API path: the JSON view, or `null` when nothing exists at that path. */
export type ApiHandler = (path: string, query: URLSearchParams) => Promise<unknown>;

/**
 * Every API view, by area: `/api/caniuse/...`, `/api/community/...`, `/api/releases/...` and
 * `/api/home`. Express serves it over HTTP (src/server.ts) and SSR calls it in-process
 * (app/core/api-transport.server.ts, which receives this very function through the request
 * context, so both share one copy of the datasets and their caches).
 */
export const handleApi: ApiHandler = async (path, query) => {
  const [, area, rest] = path.match(/^\/*([^/]+)(\/.*)?$/) ?? [];
  switch (area) {
    case 'caniuse':
      return handleCaniuse(rest ?? '', query);
    case 'community':
      return handleCommunity(rest ?? '', query);
    case 'home':
      return rest ? null : homeStats();
    case 'releases':
      return handleReleases(rest ?? '', query);
    default:
      return null;
  }
};
