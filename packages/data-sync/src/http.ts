import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CACHE_DIR = new URL('../node_modules/.cache/data-sync/', import.meta.url);

export interface CachedResponse {
  status: number;
  etag: string | null;
  link: string | null;
  body: string;
  /** When the copy was fetched (epoch milliseconds). */
  fetchedAt?: number;
  /** Served from the disk cache (no request, or a "304 Not Modified"). */
  cached: boolean;
  /** Served from the disk cache because the server errored (`staleOnError`). */
  stale?: boolean;
}

export interface GetOptions {
  /** The resource never changes (content at a git tag, a published version): fetched once, ever. */
  immutable?: boolean;
  /** A copy younger than this many seconds is good enough: no request at all. */
  maxAge?: number;
  headers?: Record<string, string>;
  /** When the server errors and a copy is cached, answer the copy instead of failing. */
  staleOnError?: boolean;
}

/**
 * GET with a disk cache (node_modules/.cache/data-sync): an immutable resource is read once, the
 * others are revalidated with their ETag, so a re-run downloads only what changed. 404 and 422 are
 * answers (cached too), other errors throw, and a 5xx or 429 is retried.
 */
export async function cachedGet(url: string, options: GetOptions = {}): Promise<CachedResponse> {
  const file = new URL(createHash('sha1').update(url).digest('hex') + '.json', CACHE_DIR);
  const cached = await readFile(file, 'utf8')
    .then((text) => ({ ...(JSON.parse(text) as CachedResponse), cached: true }))
    .catch(() => null);
  if (cached && options.immutable) return cached;
  if (cached && options.maxAge && Date.now() - (cached.fetchedAt ?? 0) < options.maxAge * 1000) {
    return cached;
  }

  const headers: Record<string, string> = {
    'User-Agent': 'openng-hub-data-sync',
    ...options.headers,
  };
  if (cached?.etag) headers['If-None-Match'] = cached.etag;
  const response = await fetchWithRetry(url, headers);
  if (response.status === 304 && cached) return cached;
  if (!response.ok && response.status !== 404 && response.status !== 422) {
    if (cached && options.staleOnError) return { ...cached, stale: true };
    throw new HttpError(response, url);
  }

  const entry: CachedResponse = {
    status: response.status,
    etag: response.headers.get('etag'),
    link: response.headers.get('link'),
    body: response.status === 404 ? '' : await response.text(),
    fetchedAt: Date.now(),
    cached: false,
  };
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, JSON.stringify({ ...entry, cached: undefined }));
  return entry;
}

export class HttpError extends Error {
  readonly response: Response;

  constructor(response: Response, url: string) {
    super(`${response.status} ${response.statusText} for ${url}`);
    this.response = response;
  }
}

/** Servers answer the odd 5xx or abuse-rate 429 under load: waits and tries again, 4 times. */
export async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  init: RequestInit = {},
): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(90_000), ...init, headers });
    const retryAfter = Number(response.headers.get('retry-after'));
    const transient = response.status >= 500 || response.status === 429 || retryAfter > 0;
    if (!transient || attempt === 4) return response;
    // A Retry-After of an hour is a "go away": wait 30 s at most, then let the caller decide.
    const seconds = Math.min(retryAfter || attempt * 3, 30);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
