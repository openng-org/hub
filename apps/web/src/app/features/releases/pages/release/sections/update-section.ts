import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagModule } from '@openng/optimus-ui/tag';

import { latestValue } from '../../../../../core/utils/query-params.utils';
import { EmptyState } from '../../../../../shared/components/empty-state';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import { ReleasesApi } from '../../../releases-api';
import { SectionHeader } from '../../../components/section-header';

/** /releases/:version/update — the migrations `ng update` runs when moving to the major. */
@Component({
  selector: 'hub-update-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TagModule, EmptyState, LoadError, Loading, SectionHeader],
  template: `
    @if (list.error()) {
      <hub-load-error what="the migrations" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <hub-section-header
        title="NG Update"
        [count]="list.items.length"
        [description]="
          'Migrations the ng update command runs for you when moving to Angular ' + list.major + '.'
        "
      />
      @if (list.items.length === 0) {
        <hub-empty-state
          title="No migrations"
          [message]="'ng update ships no migration for Angular ' + list.major + '.'"
        />
      } @else {
        <ul class="divide-y divide-surface border-y border-surface">
          @for (row of list.items; track row.repository + row.name) {
            <li
              class="hub-card-link flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 px-2 hover:bg-emphasis"
            >
              <span class="font-mono text-xs text-muted sm:w-16 shrink-0 sm:pt-1">{{
                row.version
              }}</span>
              <div class="min-w-0 flex-1">
                <a
                  class="hub-card-link-target font-mono text-sm font-medium"
                  [routerLink]="row.path"
                  >{{ row.name }}</a
                >
                <p class="text-sm text-muted">{{ row.description }}</p>
              </div>
              <p-tag [value]="row.repository" severity="secondary" class="self-start" />
            </li>
          }
        </ul>
        @if (list.detailsPath; as path) {
          <a [routerLink]="path" class="link text-sm inline-block mt-6"
            >Every migration of Angular {{ list.major }} with its example diff →</a
          >
        }
      }
    } @else {
      <hub-loading height="2.5rem" [rows]="3" label="Loading migrations" />
    }
  `,
})
export default class UpdateSection {
  readonly version = input.required<string>();

  private readonly api = inject(ReleasesApi);

  protected readonly list = resource({
    params: computed(() => Number(this.version())),
    loader: ({ params }) => this.api.update(params),
  });
  protected readonly data = latestValue(this.list);
}
