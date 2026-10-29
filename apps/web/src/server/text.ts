/** Search and slug helpers shared by every API area. */

/** Case-insensitive "contains" over any of the given fields. */
export function matches(term: string, ...fields: (string | null | undefined)[]): boolean {
  if (!term) return true;
  return fields.some((field) => (field ?? '').toLowerCase().includes(term));
}

/** A search query as the filters compare it. */
export function normalizeTerm(search: string | undefined | null): string {
  return (search ?? '').trim().toLowerCase();
}

/** URL-safe slug ("@Service decorator" -> "@service-decorator"). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
