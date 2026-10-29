import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbModule } from '@openng/optimus-ui/breadcrumb';
import { TagModule } from '@openng/optimus-ui/tag';
import type { MenuItem } from '@openng/optimus-ui/api';

import type { FeatureDetail } from '../data/api';
import { StatusMatrixTable, type StatusMatrixColumn } from '../ui/status-matrix-table';
import { STATUS_SEVERITY } from '../../ui/status-style';
import { FeatureDetailContent } from '../tabs/feature-detail-content';
import NotFoundPage from '../../pages/not-found-page';
import { pageSeo } from '../../core/seo';

const COLUMNS: StatusMatrixColumn[] = [{ key: 'feature', header: 'Feature', class: 'w-1/3' }];

/** /caniuse/:id — one feature: its status per major and everything the drawer shows, as a page. */
@Component({
  selector: 'hub-feature-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbModule, TagModule, StatusMatrixTable, FeatureDetailContent, NotFoundPage],
  template: `
    @if (feature(); as feature) {
      <p-breadcrumb [model]="breadcrumb()" [home]="home" class="mb-6 block" />

      <header class="mb-6">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-2xl font-bold leading-tight">{{ feature.name }}</h1>
          @if (feature.latest; as latest) {
            <p-tag [value]="latest.status" [severity]="severity[latest.status]" />
          }
        </div>
        @if (feature.package) {
          <p class="font-mono text-sm text-muted mt-1">{{ feature.package }}</p>
        }
      </header>

      <section class="mb-8" aria-label="Status per Angular version">
        <hub-status-matrix-table [items]="[feature]" [majors]="feature.majors" [columns]="columns">
          <ng-template #cells let-item>
            <td class="font-medium">{{ item.name }}</td>
          </ng-template>
        </hub-status-matrix-table>
      </section>

      <div class="max-w-3xl">
        <hub-feature-detail-content
          [feature]="feature"
          (navigateToFeature)="goTo($event)"
          (navigateToMigration)="goToMigration($event)"
        />
      </div>
    } @else {
      <hub-not-found-page />
    }
  `,
})
export default class FeaturePage {
  /** Resolved by the route; `null` when the id is unknown. */
  readonly feature = input.required<FeatureDetail | null>();

  private readonly router = inject(Router);

  protected readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  protected readonly columns = COLUMNS;
  protected readonly severity = STATUS_SEVERITY;

  protected readonly breadcrumb = computed<MenuItem[]>(() => [
    { label: 'Can I Use', routerLink: '/caniuse' },
    { label: this.feature()?.name ?? 'Feature' },
  ]);

  constructor() {
    pageSeo(() => {
      const feature = this.feature();
      if (!feature) return undefined;
      return {
        title: `${feature.name}: Angular support per version`,
        description:
          feature.description ??
          `${feature.name} in Angular: its status in every version, links and migration notes.`,
        path: `/caniuse/${feature.id}`,
        image: `/og/caniuse/${feature.id}.png`,
        type: 'article',
        jsonLd: feature.jsonLd,
      };
    });
  }

  protected goTo(id: string): void {
    void this.router.navigate(['/caniuse', id]);
  }

  protected goToMigration(searchTerm: string): void {
    void this.router.navigate(['/caniuse', 'update'], { queryParams: { search: searchTerm } });
  }
}
