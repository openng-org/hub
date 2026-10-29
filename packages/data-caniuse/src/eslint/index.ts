import { compareSemver } from '@openng/core-angular-versions';
import type { EslintCaniuse } from './eslint.model';
import { eslintCaniuseList } from './data';

export type { EslintCaniuse } from './eslint.model';

export function getEslintCaniuseList(): EslintCaniuse[] {
  return [...eslintCaniuseList].sort((a, b) => compareSemver(b.version, a.version));
}

export type EslintFilterParams = {
  search?: string;
  type?: string;
};

export function getFilteredEslintCaniuseList(filters?: EslintFilterParams): EslintCaniuse[] {
  let filtered = [...eslintCaniuseList];

  // Filter by search term (name or description)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (rule) =>
        rule.name.toLowerCase().includes(searchLower) ||
        rule.description.toLowerCase().includes(searchLower),
    );
  }

  // Filter by type
  if (filters?.type) {
    filtered = filtered.filter((rule) => rule.type === filters.type);
  }

  return filtered.sort((a, b) => compareSemver(b.version, a.version));
}
