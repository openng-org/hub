import { cachedGet, HttpError } from './http.ts';
import type { Repository } from './lib/migrations.ts';

const API = 'https://api.github.com';
const RAW = 'https://raw.githubusercontent.com';

/**
 * Read-only access to GitHub, cached (see http.ts): content at a tag is fetched once, lists are
 * revalidated with their ETag, and a "304 Not Modified" does not count against the rate limit.
 * Raw files come from raw.githubusercontent.com, which has no API rate limit. The token is read
 * from GITHUB_TOKEN (the `.env` file at the repository root, or the CI secret): without one GitHub
 * allows 60 API requests an hour, which a run from an empty cache exceeds.
 */
export class GitHub {
  readonly #token = process.env.GITHUB_TOKEN || null;
  #requests = 0;
  #warned = false;

  /** API requests sent this run (cache hits excluded). */
  get requests(): number {
    return this.#requests;
  }

  /** A GitHub REST API resource; `immutable` when it lives at a tag. Null on 404. */
  async api<T>(path: string, { immutable = false } = {}): Promise<T | null> {
    const response = await this.#get(`${API}${path}`, immutable);
    return response.status === 404 ? null : (JSON.parse(response.body) as T);
  }

  /** Every page of a list resource, until `done` says the rest is not needed. */
  async *pages<T>(path: string, done: (page: T[]) => boolean = () => false): AsyncGenerator<T[]> {
    let url: string | null = `${API}${path}${path.includes('?') ? '&' : '?'}per_page=100`;
    while (url) {
      const response = await this.#get(url, false);
      // List endpoints stop at 1,000 results: what lies beyond is years old.
      if (response.status === 422) return;
      const page = JSON.parse(response.body) as T[];
      yield page;
      if (page.length === 0 || done(page)) return;
      url = /<([^>]+)>;\s*rel="next"/.exec(response.link ?? '')?.[1] ?? null;
    }
  }

  /** The tags of an angular/* repository ("22.0.0", "v22.1.0"…), in one request. */
  async tags(repository: Repository): Promise<string[]> {
    const refs = await this.api<{ ref: string }[]>(
      `/repos/angular/${repository}/git/matching-refs/tags/`,
    );
    return (refs ?? []).map(({ ref }) => ref.replace('refs/tags/', ''));
  }

  /** A file of an angular/* repository at a tag (or, `immutable: false`, on a branch); null when missing. */
  async raw(
    repository: Repository,
    ref: string,
    path: string,
    { immutable = true } = {},
  ): Promise<string | null> {
    const response = await cachedGet(`${RAW}/angular/${repository}/${ref}/${path}`, { immutable });
    return response.status === 404 ? null : response.body;
  }

  async #get(url: string, immutable: boolean) {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (this.#token) headers.Authorization = `Bearer ${this.#token}`;
    try {
      const response = await cachedGet(url, { immutable, headers, staleOnError: true });
      if (!response.cached) this.#requests++;
      if (response.stale && !this.#warned) {
        console.warn('GitHub is not answering (rate limit?): using the cached lists.');
        this.#warned = true;
      }
      return response;
    } catch (error) {
      if (
        error instanceof HttpError &&
        error.response.headers.get('x-ratelimit-remaining') === '0'
      ) {
        throw new Error(
          `GitHub rate limit reached${this.#token ? '' : ': set GITHUB_TOKEN in the .env file at the repository root'}.`,
          { cause: error },
        );
      }
      throw error;
    }
  }
}
