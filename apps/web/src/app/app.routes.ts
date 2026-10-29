import { Routes } from '@angular/router';

import {
  featureResolver,
  migrationResolver,
  migrationsForMajorResolver,
  summaryResolver,
} from './caniuse/data/caniuse-api';
import { releaseSummaryResolver } from './releases/data/releases-api';
import { LATEST_MAJOR } from '@openng/core-angular-versions';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page'),
  },
  {
    path: 'events',
    loadComponent: () => import('./community/pages/events-page'),
  },
  {
    path: 'communities',
    loadComponent: () => import('./community/pages/communities-page'),
  },
  {
    path: 'podcasts',
    loadComponent: () => import('./community/pages/podcasts-page'),
  },
  {
    path: 'contribute',
    loadComponent: () => import('./community/pages/contribute-page'),
  },
  {
    path: 'caniuse',
    children: [
      // The four tabs are routes of their own: each is prerendered and linkable.
      ...(['', 'update', 'mcp', 'eslint'] as const).map((path) => ({
        path,
        loadComponent: () => import('./caniuse/pages/caniuse-page'),
        resolve: { summary: summaryResolver },
        data: { tab: path || 'features' },
      })),
      {
        path: 'update/migrations/:repository/:name',
        loadComponent: () => import('./caniuse/pages/migration-detail-page'),
        resolve: { migration: migrationResolver },
      },
      {
        path: 'update/:version',
        loadComponent: () => import('./caniuse/pages/update-version-page'),
        resolve: { data: migrationsForMajorResolver },
      },
      {
        path: ':id',
        loadComponent: () => import('./caniuse/pages/feature-page'),
        resolve: { feature: featureResolver },
      },
    ],
  },
  {
    path: 'releases',
    children: [
      { path: '', pathMatch: 'full', redirectTo: String(LATEST_MAJOR) },
      {
        path: ':version',
        loadComponent: () => import('./releases/pages/release-layout'),
        resolve: { summary: releaseSummaryResolver },
        // Filters are query params: changing one must not run the resolver again.
        runGuardsAndResolvers: 'paramsChange',
        children: [
          { path: '', loadComponent: () => import('./releases/sections/overview-section') },
          { path: 'features', loadComponent: () => import('./releases/sections/features-section') },
          { path: 'guide', loadComponent: () => import('./releases/sections/guide-section') },
          { path: 'update', loadComponent: () => import('./releases/sections/update-section') },
          { path: 'commits', loadComponent: () => import('./releases/sections/commits-section') },
          { path: 'mcp', loadComponent: () => import('./releases/sections/mcp-section') },
          { path: 'eslint', loadComponent: () => import('./releases/sections/eslint-section') },
          {
            path: 'changelogs',
            loadComponent: () => import('./releases/sections/changelogs-section'),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page'),
  },
];
