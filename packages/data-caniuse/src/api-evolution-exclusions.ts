export type ApiEvolutionExclusion = {
  name: string;
  package: string;
};

/**
 * Entries of api-deprecations.json that should not be exposed via the API.
 * Matched on both name and package to avoid excluding homonymous symbols elsewhere.
 */
const FORMS_SIGNALS_PACKAGE = '@angular/forms/signals';

export const excludedApiEvolutionEntries: ApiEvolutionExclusion[] = [
  { name: 'disabled', package: FORMS_SIGNALS_PACKAGE },
  { name: 'hidden', package: FORMS_SIGNALS_PACKAGE },
  { name: 'readonly', package: FORMS_SIGNALS_PACKAGE },
  { name: 'WithField', package: FORMS_SIGNALS_PACKAGE },
  { name: 'WithOptionalField', package: FORMS_SIGNALS_PACKAGE },
  { name: 'WithoutField', package: FORMS_SIGNALS_PACKAGE },
];

const exclusionKeys = new Set(
  excludedApiEvolutionEntries.map((entry) => `${entry.package}::${entry.name}`),
);

export function isExcludedApiEvolutionEntry(entry: { name: string; package: string }): boolean {
  return exclusionKeys.has(`${entry.package}::${entry.name}`);
}
