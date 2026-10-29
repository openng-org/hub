import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, firstValueFrom, of, throwError, type OperatorFunction } from 'rxjs';

/** The query of an API view: empty values, `null`/`undefined` and `page: 1` are defaults. */
export type ApiQuery = object;

/**
 * The URL of an API view, `/api/<path>?<query>`: parameters sorted, defaults left out, so the same
 * view always has the same URL (one HTTP cache entry, one transfer-cache entry between SSR and
 * hydration). Pass it to `httpResource`, or to `HttpClient` in a resolver.
 */
export function apiUrl(path: string, query: ApiQuery = {}): string {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query).sort(([a], [b]) => a.localeCompare(b))) {
    if (value === null || value === undefined || value === '') continue;
    if (name === 'page' && Number(value) === 1) continue;
    params.set(name, String(value));
  }
  return params.size ? `/api/${path}?${params}` : `/api/${path}`;
}

/** Whether a URL is one of the API's (`/api/...`). */
export function isApiUrl(url: string): boolean {
  return url.startsWith('/api/');
}

/** For a resolver: a view the API does not have (404) resolves to `null` instead of failing. */
export function notFoundAsNull<T>(): OperatorFunction<T, T | null> {
  return catchError((error: unknown) =>
    error instanceof HttpErrorResponse && error.status === 404 ? of(null) : throwError(() => error),
  );
}

/**
 * A one-off GET of an API view, as a promise: the next page of a list, fetched on "load more"
 * (`pagedResource`). Call in an injection context; the function returned works anywhere. Views
 * that follow signals use `httpResource(() => apiUrl(...))` instead.
 */
export function injectApiGet(): <T>(url: string) => Promise<T> {
  const http = inject(HttpClient);
  return <T>(url: string) => firstValueFrom(http.get<T>(url));
}
