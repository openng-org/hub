import { Routes } from '@angular/router';

import {
  migrationResolver,
  migrationsForMajorResolver,
  summaryResolver,
} from './features/caniuse/caniuse-api';
import { libraryResolver } from './features/libraries/libraries-api';
import { releaseSummaryResolver } from './features/releases/releases-api';
import { LATEST_MAJOR } from '@openng/core-angular-versions';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page'),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/community/pages/events-page'),
  },
  {
    path: 'communities',
    loadComponent: () => import('./features/community/pages/communities-page'),
  },
  {
    path: 'podcasts',
    loadComponent: () => import('./features/community/pages/podcasts-page'),
  },
  {
    path: 'contribute',
    loadComponent: () => import('./features/community/pages/contribute/contribute-page'),
  },
  {
    path: 'about',
    loadComponent: () => import('./core/pages/about-page'),
  },
  {
    path: 'caniuse',
    children: [
      // The four tabs are routes of their own: each is prerendered and linkable.
      ...(['', 'update', 'mcp', 'eslint'] as const).map((path) => ({
        path,
        loadComponent: () => import('./features/caniuse/pages/caniuse/caniuse-page'),
        resolve: { summary: summaryResolver },
        data: { tab: path || 'features' },
      })),
      {
        path: 'update/migrations/:repository/:name',
        loadComponent: () => import('./features/caniuse/pages/migration-detail-page'),
        resolve: { migration: migrationResolver },
      },
      {
        path: 'update/:version',
        loadComponent: () => import('./features/caniuse/pages/update-version-page'),
        resolve: { data: migrationsForMajorResolver },
      },
    ],
  },
  {
    path: 'libraries',
    children: [
      { path: '', loadComponent: () => import('./features/libraries/pages/libraries-page') },
      { path: 'score', loadComponent: () => import('./features/libraries/pages/score-page') },
      // npm names: one segment ("primeng") or two ("@ngrx/store").
      ...[':name', ':scope/:name'].map((path) => ({
        path,
        loadComponent: () => import('./features/libraries/pages/library-page'),
        resolve: { library: libraryResolver },
      })),
    ],
  },
  {
    path: 'releases',
    children: [
      { path: '', pathMatch: 'full', redirectTo: String(LATEST_MAJOR) },
      // Before ':version', which would take "commits" for a major.
      {
        path: 'commits',
        loadComponent: () => import('./features/releases/pages/commit-search-page'),
      },
      {
        path: ':version',
        loadComponent: () => import('./features/releases/pages/release/release-layout'),
        resolve: { summary: releaseSummaryResolver },
        // Filters are query params: changing one must not run the resolver again.
        runGuardsAndResolvers: 'paramsChange',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/releases/pages/release/sections/overview-section'),
          },
          {
            path: 'features',
            loadComponent: () =>
              import('./features/releases/pages/release/sections/features-section'),
          },
          {
            path: 'guide',
            loadComponent: () => import('./features/releases/pages/release/sections/guide-section'),
          },
          {
            path: 'update',
            loadComponent: () =>
              import('./features/releases/pages/release/sections/update-section'),
          },
          {
            path: 'commits',
            loadComponent: () =>
              import('./features/releases/pages/release/sections/commits-section'),
          },
          {
            path: 'mcp',
            loadComponent: () => import('./features/releases/pages/release/sections/mcp-section'),
          },
          {
            path: 'eslint',
            loadComponent: () =>
              import('./features/releases/pages/release/sections/eslint-section'),
          },
          {
            path: 'changelogs',
            loadComponent: () =>
              import('./features/releases/pages/release/sections/changelogs-section'),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./core/pages/not-found-page'),
  },
];
