import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DrawerModule } from '@openng/optimus-ui/drawer';
import { TagModule } from '@openng/optimus-ui/tag';
import { ButtonModule } from '@openng/optimus-ui/button';

import type { FeatureRow } from '../data/api';
import { CaniuseApi } from '../data/caniuse-api';
import { STATUS_SEVERITY } from '../../ui/status-style';
import { FeatureDetailContent } from './feature-detail-content';

/**
 * Right-hand drawer over the matrix. Opens instantly on the list row when it is loaded, and
 * fetches the feature's detail for the rest.
 */
@Component({
  selector: 'hub-feature-detail-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DrawerModule, TagModule, ButtonModule, FeatureDetailContent],
  template: `
    <p-drawer
      [visible]="featureId() !== null"
      (visibleChange)="onVisibleChange($event)"
      position="right"
      [modal]="true"
      [blockScroll]="true"
      ariaCloseLabel="Close"
      styleClass="w-full! md:w-[44rem]!"
    >
      <ng-template #header>
        @if (shown(); as feature) {
          <div class="min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-2xl font-bold leading-tight">{{ feature.name }}</h2>
              @if (feature.latest; as latest) {
                <p-tag [value]="latest.status" [severity]="severity[latest.status]" />
              }
            </div>
            <div class="flex items-center gap-3 mt-1 text-sm">
              @if (feature.package) {
                <span class="font-mono text-muted">{{ feature.package }}</span>
              }
              <a
                [routerLink]="['/caniuse', feature.id]"
                class="link inline-flex items-center gap-1"
              >
                <i class="pi pi-link text-xs" aria-hidden="true"></i>
                Permalink
              </a>
            </div>
          </div>
        }
      </ng-template>

      @if (shown(); as feature) {
        <hub-feature-detail-content
          [feature]="feature"
          (navigateToFeature)="navigateToFeature.emit($event)"
          (navigateToMigration)="navigateToMigration.emit($event)"
        />
      }
    </p-drawer>
  `,
})
export class FeatureDetailDrawer {
  /** Feature to show; `null` keeps the drawer closed. */
  readonly featureId = input.required<string | null>();
  /** Its list row, when loaded: shown while the detail is fetched. */
  readonly row = input<FeatureRow | null>(null);
  readonly closed = output<void>();
  readonly navigateToFeature = output<string>();
  readonly navigateToMigration = output<string>();

  private readonly api = inject(CaniuseApi);
  protected readonly severity = STATUS_SEVERITY;

  protected readonly detail = resource({
    params: () => this.featureId() ?? undefined,
    loader: ({ params }) => this.api.feature(params),
  });

  /** The detail once loaded, the row before that (and if the detail fails: the row says enough). */
  protected readonly shown = computed(() =>
    this.detail.hasValue() ? this.detail.value() : this.row(),
  );

  protected onVisibleChange(visible: boolean): void {
    if (!visible) this.closed.emit();
  }
}
