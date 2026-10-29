import type { GitHub } from './github.ts';
import {
  apiKey,
  deprecationTimelines,
  entryPointOf,
  parseGolden,
  type ApiSnapshot,
} from './lib/goldens.ts';
import { mapLimit } from './lib/util.ts';
import { minorReleases } from './lib/versions.ts';
import { OUTPUTS, writeJson } from './output.ts';

/** The oldest major Can I Use shows. */
const FIRST_MAJOR = 13;

interface Tree {
  tree: { path: string; type: string; sha: string }[];
}

/**
 * data-caniuse: the public APIs deprecated at some point (api-deprecations.json), from the API
 * goldens of the first release of every minor since v13. A report unchanged between two
 * releases (same blob) is read once.
 */
export async function syncApiDeprecations(github: GitHub): Promise<string[]> {
  const parsed = new Map<string, Map<string, boolean>>();
  const snapshots: ApiSnapshot[] = [];

  for (const { tag, version } of minorReleases(await github.tags('angular'), FIRST_MAJOR)) {
    const tree = await github.api<Tree>(
      `/repos/angular/angular/git/trees/${tag}:goldens?recursive=1`,
      { immutable: true },
    );
    if (!tree) continue;
    const reports = tree.tree.flatMap((item) => {
      const entryPoint = item.type === 'blob' ? entryPointOf(item.path) : null;
      return entryPoint ? [{ ...item, entryPoint }] : [];
    });

    const apis = new Map<string, boolean>();
    await mapLimit(reports, 8, async (report) => {
      let names = parsed.get(report.sha);
      if (!names) {
        const text = await github.raw('angular', tag, `goldens/${report.path}`);
        names = parseGolden(text ?? '');
        parsed.set(report.sha, names);
      }
      for (const [name, deprecated] of names) apis.set(apiKey(report.entryPoint, name), deprecated);
    });
    snapshots.push({ version, apis });
  }

  const timelines = deprecationTimelines(snapshots);
  return [
    `api-deprecations.json: ${await writeJson(OUTPUTS.apiDeprecations, timelines)} (${timelines.length} APIs, ${snapshots.length} releases read)`,
  ];
}
