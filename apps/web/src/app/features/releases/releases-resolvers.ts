import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { apiUrl, notFoundAsNull } from '../../core/api/api.utils';
import type { ReleaseSummary } from './releases.model';

/** /releases/:version — the layout's summary (sections, counts, links); null for an unknown major. */
export const releaseSummaryResolver: ResolveFn<ReleaseSummary | null> = (
  route: ActivatedRouteSnapshot,
) => {
  const major = Number(route.paramMap.get('version'));
  return Number.isInteger(major)
    ? inject(HttpClient)
        .get<ReleaseSummary>(apiUrl(`releases/${major}`))
        .pipe(notFoundAsNull())
    : null;
};
