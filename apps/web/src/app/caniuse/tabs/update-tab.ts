import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TagModule } from '@openng/optimus-ui/tag';
import { TreeTableModule } from '@openng/optimus-ui/treetable';

import { latestValue } from '../../core/query-params';
import { EmptyState } from '../../ui/empty-state';
import { LoadError } from '../../ui/load-error';
import { Loading } from '../../ui/loading';
import type { MigrationTreeRow } from '../data/api';
import { CaniuseApi } from '../data/caniuse-api';

/**
 * ng update migrations as a tree: version → repository (angular, angular-cli) → migration.
 * The API builds the tree (and which versions start open); each migration row links to its page.
 */
@Component({
  selector: 'hub-update-tab',
  // Same inset as the Features tab: the panels have no padding, each tab pads itself.
  host: { class: 'block px-6 pb-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TagModule, TreeTableModule, EmptyState, LoadError, Loading],
  template: `
    @if (tree.error()) {
      <hub-load-error class="py-8" what="the migrations" (retry)="tree.reload()" />
    } @else if (data(); as data) {
      @if (data.nodes.length === 0) {
        <hub-empty-state
          class="py-8"
          icon="pi pi-search"
          title="No migrations found"
          message="Try adjusting your search."
        />
      } @else {
        <p-treetable
          [value]="data.nodes"
          dataKey="key"
          [rowHover]="true"
          styleClass="p-treetable-sm"
        >
          <ng-template #header>
            <tr>
              <th>Migration</th>
              <th class="hidden md:table-cell">Description</th>
              <th class="w-24">Optional</th>
            </tr>
          </ng-template>
          <ng-template #body let-rowNode let-row="rowData">
            @let r = asRow(row);
            <tr [ttRow]="rowNode" [class.hub-row-link]="r.kind === 'migration'">
              @switch (r.kind) {
                @case ('version') {
                  <td [attr.colspan]="columnCount()">
                    <div class="flex items-center gap-2">
                      <p-treetable-toggler [rowNode]="rowNode" />
                      <span class="font-semibold">Angular {{ r.version }}</span>
                      <span class="text-sm text-muted">{{ countLabel(r.count) }}</span>
                      <a
                        [routerLink]="['/caniuse', 'update', r.major]"
                        class="link ml-auto text-sm inline-flex items-center gap-1"
                      >
                        Examples
                        <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
                      </a>
                    </div>
                  </td>
                }
                @case ('repository') {
                  <td [attr.colspan]="columnCount()">
                    <div class="flex items-center gap-2">
                      <p-treetable-toggler [rowNode]="rowNode" />
                      <p-tag [value]="r.repository" severity="secondary" />
                      <span class="text-sm text-muted">{{ countLabel(r.count) }}</span>
                    </div>
                  </td>
                }
                @case ('migration') {
                  <td class="align-top">
                    <div class="flex items-start gap-2">
                      <p-treetable-toggler [rowNode]="rowNode" />
                      <!-- The link covers the whole row (.hub-row-link in styles/ui.css). -->
                      <a
                        [routerLink]="r.migration.path"
                        class="hub-row-link-target font-mono text-sm break-words min-w-0"
                        >{{ r.migration.name }}</a
                      >
                    </div>
                  </td>
                  <td class="hidden md:table-cell text-sm text-muted align-top">
                    {{ r.migration.description || '—' }}
                  </td>
                  <td class="align-top">
                    @if (r.optional) {
                      <p-tag value="Yes" severity="info" />
                    } @else {
                      <span class="text-sm text-muted">No</span>
                    }
                  </td>
                }
              }
            </tr>
          </ng-template>
        </p-treetable>
      }
    } @else {
      <hub-loading class="py-4" height="2.5rem" label="Loading migrations" />
    }
  `,
})
export class UpdateTab {
  readonly search = input('');

  private readonly api = inject(CaniuseApi);

  protected readonly tree = resource({
    params: this.search,
    loader: ({ params }) => this.api.migrations(params),
  });
  protected readonly data = latestValue(this.tree);

  // The Description column only exists from md up; group rows must span exactly the visible columns,
  // or the hidden one keeps a share of the width on narrow screens.
  private readonly wide = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 768px)')
      .pipe(map((state) => state.matches)),
    { initialValue: true },
  );
  protected readonly columnCount = computed(() => (this.wide() ? 3 : 2));

  protected readonly asRow = (row: MigrationTreeRow) => row;

  protected countLabel(count: number): string {
    return count === 1 ? '1 migration' : `${count} migrations`;
  }
}
