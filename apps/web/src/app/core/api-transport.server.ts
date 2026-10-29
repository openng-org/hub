/**
 * Server side: the API is called in-process, through the same routing table as the Express
 * endpoints. Referenced from app.config.server.ts only, so the datasets stay out of the browser.
 *
 * Express hands its own `handleApi` over in the request context (src/server.ts), so rendering a
 * request shares the datasets and caches already loaded for /api. Prerendering at build time has
 * no request: the handler is then loaded on demand from the app's own bundle.
 */
import { inject, Injectable, REQUEST_CONTEXT } from '@angular/core';

import type { ApiHandler } from '../../server/api';
import { ApiTransport } from './api-client';

interface RequestContext {
  handleApi?: ApiHandler;
}

let bundled: Promise<ApiHandler> | null = null;

@Injectable()
export class ServerApiTransport extends ApiTransport {
  private readonly context = inject(REQUEST_CONTEXT, { optional: true }) as RequestContext | null;

  async get<T>(path: string, query: URLSearchParams): Promise<T | null> {
    const handle =
      this.context?.handleApi ??
      (await (bundled ??= import('../../server/api').then((m) => m.handleApi)));
    // Copies, like a JSON response would: callers never share the server's cached objects.
    const data = await handle(path, query);
    return data === null ? null : (structuredClone(data) as T);
  }
}
