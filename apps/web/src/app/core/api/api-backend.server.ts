/**
 * Server side, `HttpClient` requests to /api are answered in-process, through the same routing
 * table as the Express endpoints; anything else goes out with `fetch`. Referenced from
 * app.config.server.ts only, so the datasets stay out of the browser bundle.
 *
 * A backend, not an interceptor: it ends the chain, after Angular's transfer cache, which records
 * each response so hydration reads it back instead of calling the API again.
 *
 * Angular's server platform makes relative request URLs absolute against the page's own origin
 * (`http://host/api/...`) before they reach the backend: both forms are recognised, any other
 * origin goes out with `fetch`.
 *
 * Express hands its own `handleApi` over in the request context (src/server.ts), so rendering a
 * request shares the datasets and caches already loaded for /api. Prerendering at build time has
 * no request: the handler is then loaded on demand from the app's own bundle.
 */
import {
  FetchBackend,
  HttpErrorResponse,
  HttpResponse,
  type HttpEvent,
  type HttpRequest,
} from '@angular/common/http';
import { PlatformLocation } from '@angular/common';
import { inject, Injectable, REQUEST_CONTEXT } from '@angular/core';
import { from, Observable } from 'rxjs';

import type { ApiHandler } from '../../../server/api';
import { isApiUrl } from './api.utils';

/** The base relative URLs are read against, never requested. */
const RELATIVE = 'http://relative.invalid';

interface RequestContext {
  handleApi?: ApiHandler;
}

let bundled: Promise<ApiHandler> | null = null;

@Injectable()
export class ServerApiBackend extends FetchBackend {
  private readonly context = inject(REQUEST_CONTEXT, { optional: true }) as RequestContext | null;
  private readonly location = inject(PlatformLocation);

  override handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const api = this.apiRequest(req.urlWithParams);
    return api ? from(this.answer(api, req.urlWithParams)) : super.handle(req);
  }

  /** The API path and query of a request to this site's /api, relative or absolute; else null. */
  private apiRequest(url: string): URL | null {
    const { protocol, hostname, port } = this.location;
    const own = protocol.startsWith('http')
      ? new URL(`${protocol}//${hostname}${port ? `:${port}` : ''}`).origin
      : null;
    const parsed = new URL(url, RELATIVE);
    const local = parsed.origin === RELATIVE || parsed.origin === own;
    return local && isApiUrl(parsed.pathname) ? parsed : null;
  }

  private async answer(api: URL, url: string): Promise<HttpEvent<unknown>> {
    const handle =
      this.context?.handleApi ??
      (await (bundled ??= import('../../../server/api').then((m) => m.handleApi)));
    const data = await handle(api.pathname.slice('/api'.length), api.searchParams);
    if (data === null) {
      throw new HttpErrorResponse({ status: 404, statusText: 'Not Found', url });
    }
    // A copy, like a JSON response: callers never share the server's cached objects.
    return new HttpResponse({ status: 200, statusText: 'OK', url, body: structuredClone(data) });
  }
}
