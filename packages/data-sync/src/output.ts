import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

const DATA = new URL('../../', import.meta.url);

/** The generated datasets, in the data packages that publish them. */
export const OUTPUTS = {
  majors: new URL('core-angular-versions/data/majors.json', DATA),
  compatibility: new URL('core-angular-versions/data/compatibility.json', DATA),
  releaseInsights: new URL('data-releases/data/releases.json', DATA),
  githubReleases: new URL('data-releases/data/github-releases.json', DATA),
  commits: new URL('data-releases/data/commits.json', DATA),
  apiDeprecations: new URL('data-caniuse/data/api-deprecations.json', DATA),
  migrations: new URL('data-caniuse/data/angular-migrations.json', DATA),
  health: new URL('data-libraries/data/health.json', DATA),
};

/**
 * Writes a dataset as the repository formats JSON (Prettier), only when it changed: an unchanged
 * dataset leaves the file, and the pull request, alone.
 */
export async function writeJson(file: URL, data: unknown): Promise<'updated' | 'unchanged'> {
  const path = fileURLToPath(file);
  const options = (await resolveConfig(path)) ?? {};
  const text = await format(JSON.stringify(data), { ...options, filepath: path });
  const current = await readFile(file, 'utf8').catch(() => null);
  if (current === text) return 'unchanged';
  await writeFile(file, text);
  return 'updated';
}

/** A dataset as it is now (the input of a sync that adds to it). */
export async function readJson<T>(file: URL): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T;
}
