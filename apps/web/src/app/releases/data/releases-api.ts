import { inject, Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { ApiClient } from '../../core/api-client';
import type {
  ChangelogQuery,
  CommitQuery,
  GuideQuery,
  ReleaseChangelogs,
  ReleaseCommits,
  ReleaseEslint,
  ReleaseFeatures,
  ReleaseGuides,
  ReleaseMcp,
  ReleaseSummary,
  ReleaseUpdate,
} from './api';

/** Release Insights as the UI sees it: one method per section, already shaped (see api.ts). */
@Injectable({ providedIn: 'root' })
export class ReleasesApi extends ApiClient {
  summary(major: number): Promise<ReleaseSummary | null> {
    return this.get<ReleaseSummary>(`releases/${major}`);
  }

  features(major: number, status: string): Promise<ReleaseFeatures> {
    return this.required(this.get<ReleaseFeatures>(`releases/${major}/features`, { status }));
  }

  guides(major: number, query: GuideQuery): Promise<ReleaseGuides> {
    return this.required(this.get<ReleaseGuides>(`releases/${major}/guide`, { ...query }));
  }

  update(major: number): Promise<ReleaseUpdate> {
    return this.required(this.get<ReleaseUpdate>(`releases/${major}/update`));
  }

  commits(major: number, query: CommitQuery): Promise<ReleaseCommits> {
    return this.required(this.get<ReleaseCommits>(`releases/${major}/commits`, { ...query }));
  }

  mcp(major: number): Promise<ReleaseMcp> {
    return this.required(this.get<ReleaseMcp>(`releases/${major}/mcp`));
  }

  eslint(major: number): Promise<ReleaseEslint> {
    return this.required(this.get<ReleaseEslint>(`releases/${major}/eslint`));
  }

  changelogs(major: number, query: ChangelogQuery): Promise<ReleaseChangelogs> {
    return this.required(this.get<ReleaseChangelogs>(`releases/${major}/changelogs`, { ...query }));
  }
}

/** /releases/:version — the layout's summary (sections, counts, links); null for an unknown major. */
export const releaseSummaryResolver: ResolveFn<ReleaseSummary | null> = (
  route: ActivatedRouteSnapshot,
) => {
  const major = Number(route.paramMap.get('version'));
  return Number.isInteger(major) ? inject(ReleasesApi).summary(major) : null;
};
