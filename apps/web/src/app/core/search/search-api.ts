import { Injectable } from '@angular/core';

import { ApiClient } from '../api/api-client';

/** What a result is, which also picks its group in the palette. */
export type SearchKind =
  | 'page'
  | 'feature'
  | 'migration'
  | 'mcp'
  | 'eslint'
  | 'library'
  | 'release'
  | 'event'
  | 'community'
  | 'podcast';

/** Where a result lives: a page of the hub (route + query), or an outside page. */
export type SearchLink =
  { path: string[]; queryParams?: Record<string, string> } | { href: string };

export interface SearchResult {
  kind: SearchKind;
  title: string;
  /** One line under the title: package, date and place, description… */
  subtitle: string | null;
  /** The page it can be found on, said plainly: "Can I Use · NG Update", "Events". */
  where: string;
  link: SearchLink;
}

export interface SearchGroup {
  kind: SearchKind;
  label: string;
  /** `pi pi-*` icon class. */
  icon: string;
  items: SearchResult[];
  /** Matches in the group, before the per-group limit. */
  total: number;
  /** The list page with this search applied, when the group has one ("See all 12"). */
  more: SearchLink | null;
}

export interface SearchResults {
  query: string;
  groups: SearchGroup[];
  /** Matches across all groups, before the limits. */
  total: number;
}

/** The site-wide search (`/api/search?q=`, built in src/server/search.ts). */
@Injectable({ providedIn: 'root' })
export class SearchApi extends ApiClient {
  search(query: string): Promise<SearchResults> {
    return this.required(this.get<SearchResults>('search', { q: query }));
  }
}
