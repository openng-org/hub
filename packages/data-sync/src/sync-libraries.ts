import {
  LIBRARY_MAJORS,
  libraries,
  type LibraryHealth,
  type MajorSupport,
  type Vulnerability,
} from '@openng/data-libraries';

import type { GitHub } from './github.ts';
import { cachedGet } from './http.ts';
import { affectedVersions, type GithubAdvisory } from './lib/advisories.ts';
import { registryFacts, type RegistryDocument, type RegistryFacts } from './lib/npm.ts';
import { mapLimit } from './lib/util.ts';
import { OUTPUTS, readJson, writeJson } from './output.ts';

const REGISTRY = 'https://registry.npmjs.org';
const DOWNLOADS = 'https://api.npmjs.org/downloads/point/last-week';
/** "name@version" values per advisories request (GitHub takes up to 1,000; URLs stay short). */
const ADVISORIES_BATCH = 40;

/**
 * data-libraries: what npm and GitHub say about each tracked library (health.json). Only what
 * moved is downloaded again: a registry document that did not change answers "304" to one small
 * request and is read from the cache; the advisories and the repository are revalidated the same
 * way. The facts are always recomputed from the documents, so a change to the rules applies on
 * the next run.
 */
export async function syncLibraries(github: GitHub): Promise<string[]> {
  const saved = new Map(
    (await readJson<LibraryHealth[]>(OUTPUTS.health)).map((entry) => [entry.name, entry]),
  );
  const skipped: string[] = [];
  let unchanged = 0;

  const facts = await mapLimit(libraries, 6, async ({ name }) => {
    const response = await cachedGet(`${REGISTRY}/${name}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.cached) unchanged++;
    const found =
      response.status === 404
        ? null
        : registryFacts(JSON.parse(response.body) as RegistryDocument, LIBRARY_MAJORS);
    if (!found) skipped.push(name);
    return { name, facts: found };
  });

  progress(`${facts.length} registry documents read, ${unchanged} from the cache`);
  const vulnerabilities = await auditVersions(
    github,
    facts.flatMap(({ name, facts }) =>
      facts ? uniqueVersions(facts).map((version) => ({ name, version })) : [],
    ),
  );

  progress(`${vulnerabilities.size} versions with advisories`);
  const downloads = await weeklyDownloads(
    facts.flatMap((entry) => (entry.facts ? [entry.name] : [])),
    saved,
  );

  progress(`${downloads.size} download counts`);
  const health = await mapLimit(
    facts,
    6,
    async ({ name, facts }): Promise<LibraryHealth | null> => {
      if (!facts) return null;
      const majors: Record<string, MajorSupport | null> = {};
      for (const [major, support] of Object.entries(facts.majors)) {
        majors[major] = support
          ? { ...support, vulnerabilities: vulnerabilities.get(`${name}@${support.version}`) ?? [] }
          : null;
      }
      return {
        name,
        description: facts.description,
        repository: facts.repository,
        license: facts.license,
        latest: facts.latest,
        latestReleased: facts.latestReleased,
        weeklyDownloads: downloads.get(name) ?? 0,
        deprecated: facts.deprecated,
        archived: await isArchived(github, facts.repository),
        majors,
      };
    },
  );

  const entries = health.filter((entry) => entry !== null);
  const advisories = [...vulnerabilities.values()].reduce((sum, list) => sum + list.length, 0);
  return [
    `health.json: ${await writeJson(OUTPUTS.health, entries)} (${entries.length} libraries, ${unchanged} unchanged on npm, ${advisories} advisories)`,
    ...(skipped.length > 0 ? [`not on npm, left out: ${skipped.join(', ')}`] : []),
  ];
}

/** A line per phase, so a slow run says where it is. */
function progress(message: string): void {
  console.error(`  libraries: ${message}`);
}

function uniqueVersions(facts: RegistryFacts): string[] {
  const versions = Object.values(facts.majors).flatMap((s) => (s ? [s.version] : []));
  return [...new Set(versions)];
}

/**
 * The advisories affecting each version, from the GitHub Advisory Database (where npm's own
 * advisories come from): one request per batch of versions, revalidated with its ETag.
 */
async function auditVersions(
  github: GitHub,
  versions: { name: string; version: string }[],
): Promise<Map<string, Vulnerability[]>> {
  const advisories: GithubAdvisory[] = [];
  for (let start = 0; start < versions.length; start += ADVISORIES_BATCH) {
    const batch = versions.slice(start, start + ADVISORIES_BATCH);
    const affects = batch.map(({ name, version }) => `${name}@${version}`).join(',');
    for await (const page of github.pages<GithubAdvisory>(
      `/advisories?ecosystem=npm&affects=${encodeURIComponent(affects)}`,
    )) {
      advisories.push(...page);
    }
  }
  return affectedVersions(versions, advisories);
}

/**
 * Weekly downloads per library: npm's downloads API (unscoped names 128 to a request, scoped ones
 * one by one) or, where it cannot be reached, what the registry's search reports for the exact
 * name (it leaves deprecated packages out), or the saved value.
 */
async function weeklyDownloads(
  names: string[],
  saved: Map<string, LibraryHealth>,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const unscoped = names.filter((name) => !name.startsWith('@'));
  const scoped = names.filter((name) => name.startsWith('@'));
  // Where the downloads API cannot be reached (a proxy, a sandbox), the first failure says so:
  // the rest of the names go straight to the fallback instead of each waiting for a timeout.
  let reachable = true;
  const api = async (path: string): Promise<unknown> => {
    if (!reachable) return null;
    try {
      const response = await fetch(`${DOWNLOADS}/${path}`, {
        signal: AbortSignal.timeout(15_000),
      });
      return response.ok ? await response.json() : null;
    } catch {
      reachable = false;
      return null;
    }
  };
  for (let start = 0; start < unscoped.length; start += 128) {
    const batch = unscoped.slice(start, start + 128);
    const bulk = (await api(batch.join(','))) as Record<string, { downloads?: number } | null>;
    if (!bulk) break;
    for (const name of batch) counts.set(name, bulk[name]?.downloads ?? 0);
  }
  await mapLimit(scoped, 6, async (name) => {
    const one = (await api(name)) as { downloads?: number } | null;
    if (one) counts.set(name, one.downloads ?? 0);
  });

  // The registry's search rate-limits anything but one request at a time.
  await mapLimit(
    names.filter((name) => !counts.has(name)),
    1,
    async (name) => {
      // A day old is fine for a weekly count, and a run cut short picks up where it stopped.
      const response = await cachedGet(
        `${REGISTRY}/-/v1/search?text=${encodeURIComponent(name)}&size=25`,
        { staleOnError: true, maxAge: 86_400 },
      );
      const { objects } = JSON.parse(response.body) as {
        objects: { package: { name: string }; downloads?: { weekly?: number } }[];
      };
      const found = objects.find((object) => object.package.name === name)?.downloads?.weekly;
      const previous = saved.get(name)?.weeklyDownloads;
      if (found === undefined && previous === undefined) {
        console.warn(`${name}: no download count found.`);
      }
      counts.set(name, found ?? previous ?? 0);
    },
  );
  return counts;
}

async function isArchived(github: GitHub, repository: string | null): Promise<boolean> {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/.exec(repository ?? '');
  if (!match) return false;
  const repo = await github.api<{ archived?: boolean }>(`/repos/${match[1]}/${match[2]}`);
  return repo?.archived === true;
}
