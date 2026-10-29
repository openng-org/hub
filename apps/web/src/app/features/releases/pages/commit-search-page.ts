import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LATEST_MAJOR } from '@openng/core-angular-versions';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';

import {
  debouncedParam,
  injectQueryParams,
  latestValue,
  pagedResource,
} from '../../../core/utils/query-params.utils';
import { pageSeo } from '../../../core/services/seo';
import { PageHeader } from '../../../core/layout/page-header';
import { EmptyState } from '../../../shared/components/empty-state';
import { InfiniteScroll } from '../../../shared/components/infinite-scroll';
import { OptionCount } from '../../../shared/components/option-count';
import { LoadError } from '../../../shared/components/load-error';
import { Loading } from '../../../shared/components/loading';
import type { AllCommitsQuery } from '../releases.model';
import { ReleasesApi } from '../releases-api';
import { CommitList } from '../components/commit-list';

/**
 * /releases/commits — every commit of every stable Angular release, newest first, searchable in one
 * place (when did this land, in which release?). Filters live in the URL
 * (?search=&version=&type=&package=, the version being a release or a whole major); the API filters
 * and pages, the list loads more as you scroll.
 */
@Component({
  selector: 'hub-commit-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    PageHeader,
    EmptyState,
    InfiniteScroll,
    OptionCount,
    LoadError,
    Loading,
    CommitList,
  ],
  template: `
    <hub-page-header
      icon="pi pi-code"
      eyebrow="Release insights"
      title="Commit search"
      description="Every commit shipped in a stable Angular release, in one place: find when a change landed, and in which version."
    >
      <a
        hubHeaderActions
        class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm self-start shrink-0"
        [routerLink]="['/releases', latestMajor]"
      >
        <span><i class="pi pi-megaphone" aria-hidden="true"></i> Angular {{ latestMajor }}</span>
      </a>
    </hub-page-header>

    <section aria-label="Filters" class="filter-bar mb-6 flex flex-wrap items-center gap-3">
      <p-iconfield class="w-full md:w-96">
        <p-inputicon class="pi pi-search" />
        <input
          pInputText
          type="search"
          class="w-full"
          aria-label="Search commits"
          placeholder="Search commits (signal, hydration…)"
          [ngModel]="search.input()"
          (ngModelChange)="search.set($event)"
        />
      </p-iconfield>
      @if (data(); as list) {
        <p-select
          [autofocus]="false"
          [options]="list.versions"
          optionLabel="label"
          optionValue="value"
          [ngModel]="version()"
          (onChange)="params.set('version', $event.value ?? '')"
          [filter]="true"
          filterPlaceholder="22, 21.1…"
          ariaLabel="Angular version"
          styleClass="w-44"
        >
          <!-- A major ("22.x": all its releases) heads its releases, which are indented. -->
          <ng-template #item let-option
            ><hub-option-count
              [class.font-semibold]="option.major"
              [class.pl-4]="option.value && !option.major"
              [label]="option.label"
              [count]="option.count"
          /></ng-template>
        </p-select>
        <p-select
          [autofocus]="false"
          [options]="list.types"
          optionLabel="label"
          optionValue="value"
          [ngModel]="type()"
          (onChange)="params.set('type', $event.value ?? '')"
          ariaLabel="Commit type"
          styleClass="w-40"
        >
          <ng-template #item let-option
            ><hub-option-count [label]="option.label" [count]="option.count"
          /></ng-template>
        </p-select>
        <p-select
          [autofocus]="false"
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
            ><hub-option-count [label]="option.label" [count]="option.count"
          /></ng-template>
        </p-select>
      }
    </section>

    @if (list.error()) {
      <hub-load-error what="the commits" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <p class="mb-3 text-sm text-muted" [class.sr-only]="list.total === 0" aria-live="polite">
        {{ list.total }} {{ list.total === 1 ? 'commit' : 'commits'
        }}{{ hasFilters() ? ' found' : '' }}
      </p>
      @if (list.total === 0) {
        <hub-empty-state
          class="max-w-xl"
          icon="pi pi-search"
          title="No commits found"
          [message]="emptyMessage()"
          hint="Try fewer words, another version, or clearing the filters."
        >
          <button
            type="button"
            class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm mt-4"
            (click)="clearFilters()"
          >
            <span><i class="pi pi-filter-slash" aria-hidden="true"></i> Clear the filters</span>
          </button>
        </hub-empty-state>
      } @else {
        <hub-commit-list [commits]="pages.items()" [linkReleases]="true" />
        <hub-infinite-scroll [pages]="pages" what="commits" />
      }
    } @else {
      <hub-loading height="2.5rem" [rows]="6" label="Loading commits" />
    }
  `,
})
export default class CommitSearchPage {
  private readonly api = inject(ReleasesApi);
  protected readonly params = injectQueryParams();
  protected readonly latestMajor = LATEST_MAJOR;

  protected readonly version = this.params.get('version');
  protected readonly type = this.params.get('type');
  protected readonly pkg = this.params.get('package');
  protected readonly search = debouncedParam(this.params, 'search');
  private readonly searchTerm = this.params.get('search');

  private readonly query = computed<AllCommitsQuery>(() => ({
    search: this.searchTerm(),
    version: this.version(),
    type: this.type(),
    package: this.pkg(),
  }));
  protected readonly hasFilters = computed(() => Object.values(this.query()).some(Boolean));

  protected readonly list = resource({
    params: this.query,
    loader: ({ params }) => this.api.allCommits(params),
  });
  protected readonly data = latestValue(this.list);
  /** Further pages, loaded as the visitor scrolls; a filter change starts over. */
  protected readonly pages = pagedResource(
    this.list,
    (page) => this.api.allCommits({ ...this.query(), page }),
    (list) => list.items,
  );

  protected readonly emptyMessage = computed(() => {
    const { search, version } = this.query();
    const where = !version
      ? ''
      : version.includes('.')
        ? ` in ${version}`
        : ` in Angular ${version}`;
    return search ? `No commit matches "${search}"${where}.` : `No commit matches these filters.`;
  });

  constructor() {
    pageSeo({
      title: 'Angular commit search',
      description:
        'Search every commit shipped in a stable Angular release: find when a change landed, and in which version, filtered by version, type and package.',
      path: '/releases/commits',
      image: '/og/commits.png',
    });
  }

  protected clearFilters(): void {
    this.params.patch({ search: '', version: '', type: '', package: '' });
  }
}
