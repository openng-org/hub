import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from '@openng/optimus-ui/select';

import { latestValue, pagedResource } from '../../../../../core/utils/query-params.utils';
import { EmptyState } from '../../../../../shared/components/empty-state';
import { InfiniteScroll } from '../../../../../shared/components/infinite-scroll';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import type { FeatureQuery } from '../../../caniuse.model';
import { CaniuseApi } from '../../../caniuse-api';
import { StatusLegend } from '../../../components/status-legend';
import {
  StatusMatrixTable,
  type StatusMatrixColumn,
} from '../../../components/status-matrix-table';
import {
  CANIUSE_STATUS_LEGEND_ITEMS,
  STATUS_FILTER_OPTIONS,
} from '../../../../../shared/utils/status.utils';

const COLUMNS: StatusMatrixColumn[] = [{ key: 'feature', header: 'Feature', class: 'w-1/2' }];

function emptyMessage({ search, package: pkg, status }: FeatureQuery): string {
  const what = status ? `${status} features` : 'features';
  const where = pkg ? ` in the ${pkg} package` : '';
  return search ? `No ${what} found for "${search}"${where}.` : `No ${what} found${where}.`;
}

/**
 * Features tab: legend, package/status filters and the status matrix.
 * The API filters and pages the list; scrolling to the end fetches the next pages, a button the
 * ones after that.
 */
@Component({
  selector: 'hub-features-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    SelectModule,
    InfiniteScroll,
    EmptyState,
    LoadError,
    Loading,
    StatusLegend,
    StatusMatrixTable,
  ],
  template: `
    <hub-status-legend [items]="legendItems" class="mb-4 px-6" />

    <div class="filter-bar flex flex-wrap items-center gap-2 py-4 px-6">
      <p-select
        [autofocus]="false"
        [options]="packageOptions()"
        optionLabel="label"
        optionValue="value"
        [ngModel]="packageFilter()"
        (onChange)="packageFilterChange.emit($event.value ?? '')"
        placeholder="All packages"
        [showClear]="true"
        [filter]="packageOptions().length > 8"
        ariaLabel="Filter by package"
        styleClass="w-full sm:w-56"
      />
      <p-select
        [autofocus]="false"
        [options]="statusOptions"
        optionLabel="label"
        optionValue="value"
        [ngModel]="statusFilter()"
        (onChange)="statusFilterChange.emit($event.value ?? '')"
        placeholder="All statuses"
        [showClear]="true"
        ariaLabel="Filter by status"
        styleClass="w-full sm:w-56"
      >
        <ng-template #item let-option>
          <span class="flex items-center gap-2">
            <i [class]="option.icon" aria-hidden="true"></i>
            {{ option.label }}
          </span>
        </ng-template>
      </p-select>
    </div>

    @if (list.error()) {
      <hub-load-error class="px-6 py-8" what="the features" (retry)="list.reload()" />
    } @else if (data(); as list) {
      @if (list.total === 0) {
        <hub-empty-state
          class="px-6 py-8"
          icon="pi pi-search"
          title="No features found"
          [message]="emptyMessage()"
          hint="Try adjusting your search terms, status filter, or selecting a different package."
        />
      } @else {
        <hub-status-matrix-table
          class="mb-4 px-6"
          [items]="pages.items()"
          [majors]="list.majors"
          [columns]="columns"
        >
          <ng-template #cells let-feature>
            <td>
              <div
                class="cursor-help"
                data-tip="feature"
                [attr.data-s]="feature.latest?.status"
                [attr.data-v]="feature.latest?.version"
              >
                <div class="font-medium leading-tight">{{ feature.name }}</div>
                @if (feature.package) {
                  <div class="text-muted font-mono text-xs mt-0.5">{{ feature.package }}</div>
                }
                @if (feature.description) {
                  <p class="hub-feature-desc">{{ feature.description }}</p>
                }
              </div>
            </td>
          </ng-template>
        </hub-status-matrix-table>

        <hub-infinite-scroll class="px-6" [pages]="pages" what="features" height="6rem" />
        <p class="py-6 text-center text-sm text-muted" aria-live="polite">
          Showing {{ pages.items().length }} of {{ list.total }} features
        </p>
      }
    } @else {
      <hub-loading class="px-6 py-4" label="Loading features" />
    }
  `,
})
export class FeaturesTab {
  /** Options of the package filter (from the summary). */
  readonly packages = input.required<string[]>();
  readonly search = input('');
  readonly packageFilter = input('');
  readonly statusFilter = input('');

  readonly packageFilterChange = output<string>();
  readonly statusFilterChange = output<string>();
  /** Features matching the filters, for the tab badge (null while loading). */
  readonly matchCountChange = output<number | null>();

  private readonly api = inject(CaniuseApi);

  protected readonly legendItems = CANIUSE_STATUS_LEGEND_ITEMS;
  protected readonly statusOptions = [...STATUS_FILTER_OPTIONS];
  protected readonly columns = COLUMNS;

  protected readonly packageOptions = computed(() =>
    this.packages().map((pkg) => ({ label: pkg, value: pkg })),
  );

  private readonly query = computed<FeatureQuery>(() => ({
    search: this.search(),
    package: this.packageFilter(),
    status: this.statusFilter(),
  }));
  protected readonly emptyMessage = computed(() => emptyMessage(this.query()));

  /** First page for the current filters; the rest on demand. */
  protected readonly list = resource({
    params: this.query,
    loader: ({ params }) => this.api.features(params),
  });
  protected readonly data = latestValue(this.list);
  protected readonly pages = pagedResource(
    this.list,
    (page) => this.api.features({ ...this.query(), page }),
    (list) => list.items,
  );

  constructor() {
    // The page shows the count in the tab's badge: a derived value handed up, hence an effect.
    effect(() => this.matchCountChange.emit(this.data()?.total ?? null));
  }
}
