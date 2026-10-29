import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { apiUrl, notFoundAsNull } from '../../core/api/api.utils';
import type { CaniuseSummary, MigrationDetail, MigrationsForMajor } from './caniuse.model';

/** /caniuse (its four tabs) — the summary: badges, package options. SSR waits for it. */
export const summaryResolver: ResolveFn<CaniuseSummary> = () =>
  inject(HttpClient).get<CaniuseSummary>(apiUrl('caniuse/summary'));

/** /caniuse/update/:version — null for a major without migrations. */
export const migrationsForMajorResolver: ResolveFn<MigrationsForMajor | null> = (
  route: ActivatedRouteSnapshot,
) =>
  inject(HttpClient)
    .get<MigrationsForMajor>(
      apiUrl(`caniuse/migrations/major/${parseInt(route.paramMap.get('version') ?? '', 10)}`),
    )
    .pipe(notFoundAsNull());

/** /caniuse/update/migrations/:repository/:name — null for an unknown migration. */
export const migrationResolver: ResolveFn<MigrationDetail | null> = (
  route: ActivatedRouteSnapshot,
) => {
  const repository = encodeURIComponent(route.paramMap.get('repository') ?? 'angular');
  const name = encodeURIComponent(route.paramMap.get('name') ?? '');
  return inject(HttpClient)
    .get<MigrationDetail>(apiUrl(`caniuse/migrations/${repository}/${name}`))
    .pipe(notFoundAsNull());
};
