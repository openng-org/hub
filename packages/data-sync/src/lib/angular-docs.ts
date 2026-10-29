/**
 * The two angular.dev reference pages the versions come from, read from their markdown sources in
 * angular/angular (adev/src/content/reference): releases.md (support windows) and versions.md
 * (Node.js, TypeScript and RxJS ranges).
 */

/** A markdown table: its header cells, then its rows, cells unescaped (`\|` → `|`). */
export function markdownTables(markdown: string): { header: string[]; rows: string[][] }[] {
  const tables: { header: string[]; rows: string[][] }[] = [];
  let current: { header: string[]; rows: string[][] } | null = null;
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) {
      current = null;
      continue;
    }
    const cells = splitRow(line);
    if (!current) {
      current = { header: cells, rows: [] };
      tables.push(current);
    } else if (!cells.every((cell) => /^:?-+:?$/.test(cell))) {
      current.rows.push(cells);
    }
  }
  return tables;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

/** A major's release and support windows, as releases.md lists the supported ones. */
export interface SupportedMajor {
  major: number;
  released: string;
  activeEnds: string;
  ltsEnds: string;
}

/** The "Actively supported versions" table: `| ^22.0.0 | Active | 2026-06-03 | 2027-06 | 2028-06 |`. */
export function supportedMajors(releasesMd: string): SupportedMajor[] {
  const table = markdownTables(releasesMd).find(
    ({ header }) => header.includes('Released') && header.includes('LTS ends'),
  );
  if (!table) return [];
  const column = (name: string) => table.header.indexOf(name);
  return table.rows.flatMap((row) => {
    const major = /(\d+)\./.exec(row[column('Version')] ?? '')?.[1];
    const released = row[column('Released')] ?? '';
    const activeEnds = row[column('Active ends')] ?? '';
    const ltsEnds = row[column('LTS ends')] ?? '';
    const isDate = (value: string) => /^\d{4}-\d{2}(-\d{2})?$/.test(value);
    return major && isDate(released) && isDate(activeEnds) && isDate(ltsEnds)
      ? [{ major: Number(major), released, activeEnds, ltsEnds }]
      : [];
  });
}

/** One row of the compatibility tables. */
export interface Compatibility {
  angular: string;
  /** Before v9 only, when the CLI was versioned on its own. */
  angularCli?: string;
  node: string;
  typescript: string;
  rxjs: string;
}

/** Every row of versions.md's compatibility tables (supported, unsupported, before v9), in order. */
export function compatibilityRows(versionsMd: string): Compatibility[] {
  return markdownTables(versionsMd)
    .filter(({ header }) => header[0] === 'Angular' && header.includes('Node.js'))
    .flatMap(({ header, rows }) =>
      rows.map((row) => {
        const cell = (name: string) => row[header.indexOf(name)] ?? '';
        const cli = cell('Angular CLI');
        return {
          angular: cell('Angular'),
          ...(cli && cli !== '-' ? { angularCli: cli } : {}),
          node: cell('Node.js'),
          typescript: cell('TypeScript'),
          rxjs: cell('RxJS'),
        };
      }),
    );
}

/** A known major: release day, and support windows once angular.dev published them. */
export interface MajorRelease {
  major: number;
  released: string;
  activeEnds?: string;
  ltsEnds?: string;
}

/**
 * The majors after a sync, newest first: the known ones, updated with what angular.dev lists as
 * supported, plus the majors released since (from their x.0.0 release). A major angular.dev lists
 * ahead of its release day waits for it; one it stopped listing keeps the last windows it had.
 */
export function mergeMajors(
  known: MajorRelease[],
  supported: SupportedMajor[],
  released: { major: number; released: string }[],
  today: string,
): MajorRelease[] {
  const byMajor = new Map(known.map((release) => [release.major, { ...release }]));
  for (const release of released) {
    if (!byMajor.has(release.major)) byMajor.set(release.major, release);
  }
  for (const release of supported) {
    if (release.released <= today || byMajor.has(release.major))
      byMajor.set(release.major, release);
  }
  return [...byMajor.values()].sort((a, b) => b.major - a.major);
}
