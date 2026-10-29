import { inject, Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { ApiClient } from '../../core/api/api-client';
import type {
  CaniuseSummary,
  EslintList,
  EslintQuery,
  FeatureList,
  FeatureQuery,
  McpList,
  MigrationDetail,
  MigrationsForMajor,
  MigrationTree,
  TabCounts,
} from './caniuse.model';

/**
 * The Can I Use API as the UI sees it: one method per view, already shaped for rendering (see
 * api.ts). Caching and the SSR handoff live in ApiClient.
 */
@Injectable({ providedIn: 'root' })
export class CaniuseApi extends ApiClient {
  summary(): Promise<CaniuseSummary> {
    return this.required(this.get<CaniuseSummary>('caniuse/summary'));
  }

  counts(search: string): Promise<TabCounts> {
    return this.required(this.get<TabCounts>('caniuse/counts', { search }));
  }

  features(query: FeatureQuery): Promise<FeatureList> {
    return this.required(this.get<FeatureList>('caniuse/features', { ...query }));
  }

  migrations(search: string): Promise<MigrationTree> {
    return this.required(this.get<MigrationTree>('caniuse/migrations', { search }));
  }

  migrationsForMajor(major: number): Promise<MigrationsForMajor | null> {
    return this.get<MigrationsForMajor>(`caniuse/migrations/major/${major}`);
  }

  migration(repository: string, name: string): Promise<MigrationDetail | null> {
    return this.get<MigrationDetail>(
      `caniuse/migrations/${encodeURIComponent(repository)}/${encodeURIComponent(name)}`,
    );
  }

  mcp(search: string): Promise<McpList> {
    return this.required(this.get<McpList>('caniuse/mcp', { search }));
  }

  eslint(query: EslintQuery): Promise<EslintList> {
    return this.required(this.get<EslintList>('caniuse/eslint', { ...query }));
  }
}

/** /caniuse — the summary (badges, package options); SSR waits for it. */
export const summaryResolver: ResolveFn<CaniuseSummary> = () => inject(CaniuseApi).summary();

/** /caniuse/update/:version */
export const migrationsForMajorResolver: ResolveFn<MigrationsForMajor | null> = (
  route: ActivatedRouteSnapshot,
) => inject(CaniuseApi).migrationsForMajor(parseInt(route.paramMap.get('version') ?? '', 10));

/** /caniuse/update/migrations/:repository/:name */
export const migrationResolver: ResolveFn<MigrationDetail | null> = (
  route: ActivatedRouteSnapshot,
) =>
  inject(CaniuseApi).migration(
    route.paramMap.get('repository') ?? 'angular',
    route.paramMap.get('name') ?? '',
  );
