import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';

import {
  debouncedParam,
  injectQueryParams,
  latestValue,
  pagedResource,
} from '../../core/query-params';
import { EmptyState } from '../../ui/empty-state';
import { LoadError } from '../../ui/load-error';
import { Loading } from '../../ui/loading';
import type { CommitQuery } from '../data/api';
import { ReleasesApi } from '../data/releases-api';
import { SectionHeader } from '../ui/section-header';
import { TextParts } from '../ui/text-parts';

/**
 * /releases/:version/commits — every commit of the major's stable releases, newest first, 50 at a
 * time. Filters live in the URL (?search=&type=&package=&version=); the API does the filtering.
 */
@Component({
  selector: 'hub-commits-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    EmptyState,
    LoadError,
    Loading,
    SectionHeader,
    TextParts,
  ],
  template: `
    @if (list.error()) {
      <hub-load-error what="the commits" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <hub-section-header
        title="Commits"
        [count]="list.total"
        [description]="
          'Every commit shipped in the stable releases of Angular ' +
          list.major +
          ', from the GitHub changelogs.'
        "
      >
        <div class="filter-bar mt-4 flex flex-wrap items-center gap-3">
          <p-iconfield class="w-full sm:w-72">
            <p-inputicon class="pi pi-search" />
            <input
              pInputText
              type="search"
              class="w-full"
              aria-label="Search commits"
              placeholder="Search commits…"
              [ngModel]="search.input()"
              (ngModelChange)="search.set($event)"
            />
          </p-iconfield>
          <p-select
            [options]="list.types"
            optionLabel="label"
            optionValue="value"
            [ngModel]="type()"
            (onChange)="params.set('type', $event.value ?? '')"
            ariaLabel="Commit type"
            styleClass="w-40"
          >
            <ng-template #item let-option
              >{{ option.label }} <span class="text-muted">({{ option.count }})</span></ng-template
            >
          </p-select>
          <p-select
            [options]="list.packages"
            optionLabel="label"
            optionValue="value"
            [ngModel]="pkg()"
            (onChange)="params.set('package', $event.value ?? '')"
            [filter]="true"
            ariaLabel="Package"
            styleClass="w-48"
          >
            <ng-template #item let-option
              >{{ option.label }} <span class="text-muted">({{ option.count }})</span></ng-template
            >
          </p-select>
          <p-select
            [options]="list.versions"
            optionLabel="label"
            optionValue="value"
            [ngModel]="release()"
            (onChange)="params.set('version', $event.value ?? '')"
            [filter]="true"
            ariaLabel="Release"
            styleClass="w-40"
          >
            <ng-template #item let-option
              >{{ option.label }} <span class="text-muted">({{ option.count }})</span></ng-template
            >
          </p-select>
        </div>
      </hub-section-header>

      @if (list.total === 0) {
        <hub-empty-state title="No commits" message="No commit matches these filters." />
      } @else {
        <ul class="divide-y divide-surface border-y border-surface">
          @for (commit of pages.items(); track commit.sha) {
            <li
              class="hub-card-link flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 px-2 hover:bg-emphasis"
            >
              <span class="hub-commit-type" [attr.data-type]="commit.type">{{ commit.type }}</span>
              <span class="font-mono text-xs text-muted">{{ commit.package }}</span>
              <a
                class="hub-card-link-target text-sm min-w-0 flex-1 basis-64"
                [href]="commit.url"
                target="_blank"
                rel="noopener noreferrer"
                ><hub-text-parts [parts]="commit.description"
              /></a>
              <span class="font-mono text-xs text-muted">{{ commit.version }}</span>
              <span class="font-mono text-xs text-muted">{{ commit.shortSha }}</span>
            </li>
          }
        </ul>
        @if (pages.hasMore()) {
          <div class="flex flex-col items-center gap-2 py-8">
            @if (pages.error()) {
              <span class="text-sm text-muted" role="alert">More commits could not be loaded.</span>
            }
            <p-button
              [label]="
                pages.error()
                  ? 'Try again'
                  : 'More commits (' + (list.total - pages.items().length) + ' left)'
              "
              icon="pi pi-chevron-down"
              [outlined]="true"
              [loading]="pages.loading()"
              (onClick)="pages.loadMore()"
            />
          </div>
        }
      }
    } @else {
      <hub-loading height="2.5rem" [rows]="3" label="Loading commits" />
    }
  `,
})
export default class CommitsSection {
  readonly version = input.required<string>();

  private readonly api = inject(ReleasesApi);
  protected readonly params = injectQueryParams();
  protected readonly type = this.params.get('type');
  protected readonly pkg = this.params.get('package');
  protected readonly release = this.params.get('version');
  protected readonly search = debouncedParam(this.params, 'search');
  private readonly searchTerm = this.params.get('search');

  private readonly query = computed(() => ({
    major: Number(this.version()),
    filters: {
      search: this.searchTerm(),
      type: this.type(),
      package: this.pkg(),
      version: this.release(),
    } satisfies CommitQuery,
  }));

  protected readonly list = resource({
    params: this.query,
    loader: ({ params }) => this.api.commits(params.major, params.filters),
  });
  protected readonly data = latestValue(this.list);
  /** Further pages, loaded with "More commits"; a filter change starts over. */
  protected readonly pages = pagedResource(
    this.list,
    (page) => {
      const { major, filters } = this.query();
      return this.api.commits(major, { ...filters, page });
    },
    (list) => list.items,
  );
}
