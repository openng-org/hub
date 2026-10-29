import {
  affectedVersions,
  healthScore,
  LIBRARY_MAJORS,
  libraries,
  registryFacts,
  type GithubAdvisory,
  type HealthRule,
  type LibraryHealth,
  type MajorSupport,
  type RegistryDocument,
  type RegistryFacts,
} from '@openng/data-libraries';

import type { LibraryCheck, LibraryCheckError } from '../../app/features/libraries/libraries.model';
import { detailOf } from './index';

const REGISTRY = 'https://registry.npmjs.org';
const DOWNLOADS = 'https://api.npmjs.org/downloads/point/last-week';
const GITHUB = 'https://api.github.com';
/** How long a live result is served again before npm and GitHub are asked anew. */
const TTL = 60 * 60 * 1000;
/** Results kept in memory (the oldest go first). */
const CAPACITY = 200;
const TIMEOUT = 20_000;

/** npm's own rule for a package name: lowercase, URL-safe, scoped or not. */
const NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * The npm name in what a visitor pasted: a package URL ("https://www.npmjs.com/package/@ngrx/store",
 * with or without "/v/1.2.3"), "npm:name", "name@1.2.3", or the bare name. Null when none fits.
 */
export function packageName(input: string): string | null {
  let value = input.trim().replace(/^npm:/, '');
  const url = /npmjs\.(?:com|org)\/package\/((?:@[^/\s]+\/)?[^/\s?#]+)/.exec(value);
  if (url) value = url[1]!;
  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }
  // A version suffix: "name@1.2.3" (the leading "@" of a scope is not one).
  value = value.replace(/(.)@.*$/, '$1');
  return value.length <= 214 && NAME.test(value) ? value : null;
}

const cache = new Map<string, { at: number; result: Promise<LibraryCheck | LibraryCheckError> }>();

/**
 * The health of any npm package, read live: its registry document, the advisories of the versions
 * it recommends, its weekly downloads and whether its repository is archived; the same rules as
 * the tracked libraries. A source that does not answer leaves its rule out of the score and is
 * named in `caveats`. Results are kept an hour, except when npm itself did not answer.
 */
export function checkLibrary(input: string): Promise<LibraryCheck | LibraryCheckError> {
  const name = packageName(input);
  if (!name) return Promise.resolve({ error: 'invalid-name' });
  const hit = cache.get(name);
  if (hit && Date.now() - hit.at < TTL) return hit.result;
  const result = check(name).catch((): LibraryCheckError => ({ error: 'unreachable' }));
  cache.set(name, { at: Date.now(), result });
  if (cache.size > CAPACITY) cache.delete(cache.keys().next().value!);
  // npm not answering is not kept: the next visitor tries again.
  void result.then((value) => {
    if ('error' in value && value.error === 'unreachable') cache.delete(name);
  });
  return result;
}

async function check(name: string): Promise<LibraryCheck | LibraryCheckError> {
  const response = await fetch(`${REGISTRY}/${name}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (response.status === 404) return { error: 'not-found' };
  if (!response.ok) return { error: 'unreachable' };
  const facts = registryFacts((await response.json()) as RegistryDocument, LIBRARY_MAJORS);
  if (!facts) return { error: 'not-found' };

  const [advisories, downloads, archived] = await Promise.all([
    vulnerabilities(name, facts),
    weeklyDownloads(name),
    isArchived(facts.repository),
  ]);
  const unavailable: HealthRule[] = [];
  const caveats: string[] = [];
  if (advisories === null) {
    unavailable.push('vulnerabilities');
    caveats.push('GitHub did not answer: known vulnerabilities were not checked.');
  }
  if (downloads === null) {
    unavailable.push('popularity');
    caveats.push('npm did not report the weekly downloads: popularity was not scored.');
  }
  if (archived === null) {
    caveats.push('GitHub did not answer: whether the repository is archived is unknown.');
  }

  const majors: Record<string, MajorSupport | null> = {};
  for (const [major, support] of Object.entries(facts.majors)) {
    majors[major] = support
      ? { ...support, vulnerabilities: advisories?.get(`${name}@${support.version}`) ?? [] }
      : null;
  }
  const health: LibraryHealth = {
    name,
    description: facts.description,
    repository: facts.repository,
    license: facts.license,
    latest: facts.latest,
    latestReleased: facts.latestReleased,
    weeklyDownloads: downloads ?? 0,
    deprecated: facts.deprecated,
    archived: archived === true,
    majors,
  };
  const tracked = libraries.find((library) => library.name === name);
  const detail = detailOf(health, tracked?.category ?? 'other', (major) =>
    healthScore(health, major, { unavailable }),
  );
  if (downloads === null) detail.downloads = 'unknown';
  return {
    detail,
    tracked: tracked !== undefined,
    caveats,
    checkedAt: new Date().toISOString(),
  };
}

/** The advisories of the recommended versions, from the GitHub Advisory Database; null when it did not answer. */
async function vulnerabilities(name: string, facts: RegistryFacts) {
  const versions = [
    ...new Set(Object.values(facts.majors).flatMap((s) => (s ? [s.version] : []))),
  ].map((version) => ({ name, version }));
  if (versions.length === 0) return new Map();
  const affects = versions.map(({ version }) => `${name}@${version}`).join(',');
  const page = await github<GithubAdvisory[]>(
    `/advisories?ecosystem=npm&per_page=100&affects=${encodeURIComponent(affects)}`,
  );
  return page === undefined ? null : affectedVersions(versions, page ?? []);
}

/** Last week's downloads; null when the downloads API did not answer. */
async function weeklyDownloads(name: string): Promise<number | null> {
  try {
    const response = await fetch(`${DOWNLOADS}/${name}`, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!response.ok) return null;
    const { downloads } = (await response.json()) as { downloads?: number };
    return typeof downloads === 'number' ? downloads : null;
  } catch {
    return null;
  }
}

/** Whether the GitHub repository is archived; false without one, null when GitHub did not answer. */
async function isArchived(repository: string | null): Promise<boolean | null> {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/.exec(repository ?? '');
  if (!match) return false;
  const repo = await github<{ archived?: boolean }>(`/repos/${match[1]}/${match[2]}`);
  // A repository npm points at but GitHub no longer has: not archived, gone.
  return repo === undefined ? null : repo?.archived === true;
}

/**
 * A GitHub REST resource: the value, null on 404, undefined when GitHub did not answer (rate
 * limit, network). GITHUB_TOKEN, when the server has one, raises the limit from 60 requests an
 * hour to 5,000.
 */
async function github<T>(path: string): Promise<T | null | undefined> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env['GITHUB_TOKEN'];
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const response = await fetch(`${GITHUB}${path}`, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (response.status === 404) return null;
    return response.ok ? ((await response.json()) as T) : undefined;
  } catch {
    return undefined;
  }
}
