import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbModule } from '@openng/optimus-ui/breadcrumb';
import { DividerModule } from '@openng/optimus-ui/divider';
import { SelectModule } from '@openng/optimus-ui/select';
import type { MenuItem } from '@openng/optimus-ui/api';

import type { MigrationsForMajor } from '../data/api';
import { MigrationDetail } from '../ui/migration-detail';
import NotFoundPage from '../../pages/not-found-page';
import { pageSeo } from '../../core/seo';

/** /caniuse/update/:version — every ng update migration shipped in that major, with example diffs. */
@Component({
  selector: 'hub-update-version-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    BreadcrumbModule,
    DividerModule,
    SelectModule,
    MigrationDetail,
    NotFoundPage,
  ],
  template: `
    @if (data(); as data) {
      <p-breadcrumb [model]="breadcrumb()" [home]="home" class="mb-4 block" />

      <header class="mb-6">
        <div class="flex flex-wrap items-center gap-4 mb-2">
          <h1 class="text-2xl font-bold">NG update Migrations — Angular {{ version() }}</h1>
          <p-select
            [options]="versionOptions()"
            optionLabel="label"
            optionValue="value"
            [ngModel]="data.major"
            (onChange)="goTo($event.value)"
            ariaLabel="Angular version"
            styleClass="w-40"
          />
        </div>
        <p class="text-muted">
          Migrations available with the
          <code
            class="rounded bg-surface-100 dark:bg-surface-800 text-color px-1.5 py-0.5 font-mono text-sm"
            >ng update</code
          >
          Angular CLI command for Angular {{ version() }}. Details and example diffs below.
        </p>
      </header>

      <div class="max-w-5xl">
        @for (migration of data.migrations; track migration.name; let first = $first) {
          @if (!first) {
            <p-divider styleClass="my-12" />
          }
          <hub-migration-detail [migration]="migration" />
        }
      </div>
    } @else {
      <hub-not-found-page />
    }
  `,
})
export default class UpdateVersionPage {
  /** Resolved by the route; `null` for a major without migrations. */
  readonly data = input.required<MigrationsForMajor | null>();
  /** Route parameter. */
  readonly version = input.required<string>();

  private readonly router = inject(Router);

  protected readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  protected readonly versionOptions = computed(() =>
    (this.data()?.majors ?? []).map((version) => ({
      label: `Angular ${version}`,
      value: version,
    })),
  );

  protected readonly breadcrumb = computed<MenuItem[]>(() => [
    { label: 'Can I Use', routerLink: '/caniuse' },
    { label: 'NG Update', routerLink: '/caniuse/update' },
    { label: `Angular ${this.version()}` },
  ]);

  constructor() {
    pageSeo(() =>
      this.data()
        ? {
            title: `ng update migrations of Angular ${this.version()}`,
            description: `Every migration ng update runs when moving to Angular ${this.version()}, with example diffs.`,
            path: `/caniuse/update/${this.version()}`,
            image: '/og/caniuse.png',
          }
        : undefined,
    );
  }

  protected goTo(version: number): void {
    void this.router.navigate(['/caniuse', 'update', String(version)]);
  }
}
