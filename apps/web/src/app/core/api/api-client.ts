import { inject, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export type ApiQuery = Record<string, string | number | null | undefined>;

/**
 * How a request reaches the API: over HTTP in the browser (api-transport.browser.ts), in-process
 * on the server (api-transport.server.ts). `path` is relative to /api; resolves `null` when nothing
 * exists there.
 */
export abstract class ApiTransport {
  abstract get<T>(path: string, query: URLSearchParams): Promise<T | null>;
}

/**
 * Base of the API services (CaniuseApi, CommunityApi, ReleasesApi, HomeApi): each request is made
 * once per app instance, and what the server rendered travels in the transfer state, so hydration
 * does not refetch it.
 */
export abstract class ApiClient {
  private readonly transport = inject(ApiTransport);
  private readonly transferState = inject(TransferState);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly requests = new Map<string, Promise<unknown>>();

  protected async required<T>(request: Promise<T | null>): Promise<T> {
    const data = await request;
    if (data === null) throw new Error('API: unexpected empty response');
    return data;
  }

  /** One request per path + query, through the transfer state, then the transport. */
  protected get<T>(path: string, query: ApiQuery = {}): Promise<T | null> {
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(query).sort(([a], [b]) => a.localeCompare(b))) {
      // Defaults are left out, so "page 1, no search" and "no params" share a cache entry.
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(name === 'page' && value === 1)
      ) {
        params.set(name, String(value));
      }
    }
    const url = params.size ? `${path}?${params}` : path;
    let request = this.requests.get(url) as Promise<T | null> | undefined;
    if (!request) {
      request = this.load<T>(url, path, params);
      request.catch(() => this.requests.delete(url));
      this.requests.set(url, request);
    }
    return request;
  }

  private async load<T>(url: string, path: string, params: URLSearchParams): Promise<T | null> {
    const key = makeStateKey<T | null>(`api:${url}`);
    if (this.transferState.hasKey(key)) return this.transferState.get(key, null);
    const data = await this.transport.get<T>(path, params);
    if (this.isServer) this.transferState.set(key, data);
    return data;
  }
}
