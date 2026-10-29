import { GitHub } from './github.ts';
import { syncApiDeprecations } from './sync-api-deprecations.ts';
import { syncMigrations } from './sync-migrations.ts';
import { syncLibraries } from './sync-libraries.ts';
import { syncReleases } from './sync-releases.ts';
import { syncVersions } from './sync-versions.ts';

/**
 * `pnpm data:sync [versions] [releases] [apis] [migrations] [libraries]` (all of them, in this order, by
 * default): refreshes the datasets read from Angular's GitHub repositories. Set GITHUB_TOKEN in the
 * .env file at the repository root (see .env.example).
 */
const STEPS = {
  versions: syncVersions,
  releases: syncReleases,
  apis: syncApiDeprecations,
  migrations: syncMigrations,
  libraries: syncLibraries,
} satisfies Record<string, (github: GitHub) => Promise<string[]>>;

type Step = keyof typeof STEPS;
const isStep = (name: string): name is Step => name in STEPS;

const requested = process.argv.slice(2);
const unknown = requested.filter((name) => !isStep(name));
if (unknown.length > 0) {
  console.error(`Unknown step: ${unknown.join(', ')}. Steps: ${Object.keys(STEPS).join(', ')}.`);
  process.exit(1);
}

const github = new GitHub();
if (!process.env.GITHUB_TOKEN) {
  console.warn('No GITHUB_TOKEN: limited to 60 GitHub API requests an hour (see .env.example).');
}
for (const step of requested.length > 0
  ? requested.filter(isStep)
  : (Object.keys(STEPS) as Step[])) {
  const started = performance.now();
  try {
    const lines = await STEPS[step](github);
    const seconds = ((performance.now() - started) / 1000).toFixed(1);
    console.log(`${step} (${seconds}s)\n${lines.map((line) => `  ${line}`).join('\n')}`);
  } catch (error) {
    console.error(`${step} failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
console.log(`${github.requests} GitHub API requests.`);
