/** Major of "21.1.0", "v21.1.0", "^21", "21" -> 21; NaN when there is no leading number. */
export function majorOf(version: string): number {
  const match = /^[^\d]*(\d+)/.exec(version);
  return match?.[1] ? parseInt(match[1], 10) : Number.NaN;
}

/** "v21.1.0" -> "21.1.0" (a leading "v" only). */
export function stripVersionPrefix(tag: string): string {
  return tag.startsWith('v') ? tag.slice(1) : tag;
}

/** Normalizes "v9", "9-beta", "9.1-rc.1", "9.1.2+build" to "X.Y.Z" for stable sorting and storage. */
export function normalizeSemver(version: string): string {
  const v = stripVersionPrefix(version);

  const full = /^(\d+\.\d+\.\d+)/.exec(v);
  if (full) return full[1] ?? full[0];

  const majorMinor = /^(\d+)\.(\d+)(?:[.-].*)?$/.exec(v);
  if (majorMinor) return `${majorMinor[1] ?? '0'}.${majorMinor[2] ?? '0'}.0`;

  const majorOnly = /^(\d+)(?:[.-].*)?$/.exec(v);
  if (majorOnly) return `${majorOnly[1] ?? '0'}.0.0`;

  return version;
}

/** GitHub ref for an Angular release: tags are prefixed with "v" from 21.1.0 on. */
export function versionToRef(version: string): string {
  const parts = version.split('.').map(Number);
  const major = parts[0] ?? 0;
  const minor = parts[1] ?? 0;
  if (major > 21 || (major === 21 && minor >= 1)) {
    return 'v' + version;
  }
  return version;
}

/** Numeric comparison of two versions ("21.1.0", "v21.1", "9") — ascending; use `(a, b) => compareSemver(b, a)` for newest first. */
export function compareSemver(a: string, b: string): number {
  const pa = normalizeSemver(a).split('.').map(Number);
  const pb = normalizeSemver(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
