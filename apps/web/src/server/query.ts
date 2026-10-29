/**
 * Reading an API request the same way in every area: path segments (percent-decoded, or `null`
 * when the encoding is broken), integers with a floor, enumerations with a default, and one
 * pagination for every list.
 */

/** "/features/%40for/" → ["features", "@for"]; `null` when a segment cannot be decoded. */
export function segments(path: string): string[] | null {
  try {
    return path.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }
}

/** A whole number from a query value, `fallback` when missing or not a number, never below `min`. */
export function int(value: string | null | undefined, fallback: number, min = 1): number {
  const parsed = /^-?\d+$/.test(value ?? '') ? Number(value) : Number.NaN;
  return Math.max(min, Number.isFinite(parsed) ? parsed : fallback);
}

/** A strictly numeric path segment ("22" yes, "22.0", "0x16" or "" no), or `null`. */
export function naturalNumber(value: string | undefined): number | null {
  return value !== undefined && /^\d+$/.test(value) ? Number(value) : null;
}

/** One of the allowed values, or the default. */
export function oneOf<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(value ?? '') ? (value as T) : fallback;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

/** One page of a list: the page is clamped to what exists, so a wrong number still answers. */
export function paginate<T>(list: T[], page: number, size: number): Paged<T> {
  const pageCount = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    items: list.slice((current - 1) * size, current * size),
    total: list.length,
    page: current,
    pageCount,
  };
}
