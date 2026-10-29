import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { injectQueryParams, latestValue } from '../../core/query-params';
import { ChipFilter } from '../../ui/chip-filter';
import { EmptyState } from '../../ui/empty-state';
import { LoadError } from '../../ui/load-error';
import { Loading } from '../../ui/loading';
import { StatusPill } from '../../ui/status-pill';
import { ReleasesApi } from '../data/releases-api';
import { SectionHeader } from '../ui/section-header';

/** /releases/:version/features — features whose stage changed in the major (?status= filters). */
@Component({
  selector: 'hub-features-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ChipFilter, EmptyState, LoadError, Loading, SectionHeader, StatusPill],
  template: `
    @if (list.error()) {
      <hub-load-error what="the features" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <hub-section-header
        title="Features"
        [description]="
          'Angular features that changed stage in ' +
          list.major +
          '.x' +
          (list.previousMajor ? ', compared to the end of ' + list.previousMajor + '.x.' : '.')
        "
      >
        <hub-chip-filter
          class="mt-4"
          label="Status reached"
          [options]="list.statuses"
          [value]="status()"
          (valueChange)="params.set('status', $event)"
        />
      </hub-section-header>

      @if (list.total === 0) {
        <hub-empty-state
          title="No changes"
          [message]="'No feature changed stage in Angular ' + list.major + '.'"
        >
          <a routerLink="/caniuse" class="link text-sm inline-block mt-3"
            >Every Angular feature →</a
          >
        </hub-empty-state>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-muted border-b border-surface">
                <th class="py-2 pr-4 font-medium">Feature</th>
                <th class="py-2 pr-4 font-medium whitespace-nowrap">
                  {{ list.previousMajor ? 'End of ' + list.previousMajor : 'Before' }}
                </th>
                <th class="py-2 pr-4 font-medium whitespace-nowrap">In {{ list.major }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of list.items; track row.id) {
                <tr class="hub-row-link border-b border-surface hover:bg-emphasis">
                  <td class="py-2.5 pr-4">
                    <a
                      class="hub-row-link-target font-medium"
                      [routerLink]="['/caniuse', row.id]"
                      >{{ row.name }}</a
                    >
                    <span class="block text-xs text-muted font-mono">{{ row.package }}</span>
                  </td>
                  <td class="py-2.5 pr-4"><hub-status-pill [status]="row.previous" /></td>
                  <td class="py-2.5 pr-4">
                    <div class="flex flex-wrap items-center gap-2">
                      <hub-status-pill [status]="row.current" />
                      @if (row.change === 'new') {
                        <span class="font-brand text-lg leading-none text-primary">NEW</span>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <a routerLink="/caniuse" class="link text-sm inline-block mt-6">Every Angular feature →</a>
      }
    } @else {
      <hub-loading height="2.5rem" [rows]="3" label="Loading features" />
    }
  `,
})
export default class FeaturesSection {
  /** Route parameter. */
  readonly version = input.required<string>();

  private readonly api = inject(ReleasesApi);
  protected readonly params = injectQueryParams();
  protected readonly status = this.params.get('status');

  protected readonly list = resource({
    params: computed(() => ({ major: Number(this.version()), status: this.status() })),
    loader: ({ params }) => this.api.features(params.major, params.status),
  });
  protected readonly data = latestValue(this.list);
}
