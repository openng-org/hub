import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BreadcrumbModule } from '@openng/optimus-ui/breadcrumb';
import type { MenuItem } from '@openng/optimus-ui/api';

import type { MigrationDetail as MigrationDetailData } from '../caniuse.model';
import { MigrationDetail } from '../components/migration-detail';
import NotFoundPage from '../../../core/pages/not-found-page';
import { pageSeo } from '../../../core/services/seo';

/** /caniuse/update/migrations/:repository/:name — one migration and its example diff. */
@Component({
  selector: 'hub-migration-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbModule, MigrationDetail, NotFoundPage],
  template: `
    @if (migration(); as migration) {
      <p-breadcrumb [model]="breadcrumb()" [home]="home" class="mb-6 block" />
      <div class="max-w-5xl">
        <hub-migration-detail [migration]="migration" />
      </div>
    } @else {
      <hub-not-found-page />
    }
  `,
})
export default class MigrationDetailPage {
  /** Resolved by the route; `null` when unknown. */
  readonly migration = input.required<MigrationDetailData | null>();

  protected readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  protected readonly breadcrumb = computed<MenuItem[]>(() => [
    { label: 'Can I Use', routerLink: '/caniuse' },
    { label: 'NG Update', routerLink: '/caniuse/update' },
    { label: this.migration()?.name ?? 'Migration', styleClass: 'font-mono' },
  ]);

  constructor() {
    pageSeo(() => {
      const migration = this.migration();
      return migration
        ? {
            title: `${migration.name}: ng update migration`,
            description:
              migration.description || `The ${migration.name} ng update migration of Angular.`,
            image: '/og/caniuse.png',
            type: 'article',
          }
        : undefined;
    });
  }
}
