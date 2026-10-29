import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconField } from '@openng/optimus-ui/iconfield';
import { InputIcon } from '@openng/optimus-ui/inputicon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';

import { apiUrl, injectApiGet } from '../../../core/api/api.utils';
import type { LibraryList } from '../libraries.model';
import {
  debouncedParam,
  injectQueryParams,
  latestValue,
  pagedResource,
} from '../../../core/utils/query-params.utils';
import { pageSeo } from '../../../core/services/seo';
import { PageHeader } from '../../../core/layout/page-header';
import { ChipFilter, type ChipOption } from '../../../shared/components/chip-filter';
import { EmptyState } from '../../../shared/components/empty-state';
import { InfiniteScroll } from '../../../shared/components/infinite-scroll';
import { LoadError } from '../../../shared/components/load-error';
import { Loading } from '../../../shared/components/loading';
import { OptionCount } from '../../../shared/components/option-count';
import type { LibraryQuery, LibrarySort } from '../libraries.model';
import { ExperimentalBanner } from '../components/experimental-banner';
import { HealthBadge } from '../components/health-badge';

const SORT_OPTIONS: ChipOption[] = [
  { value: '', label: 'Healthiest', icon: 'pi pi-heart' },
  { value: 'downloads', label: 'Most used', icon: 'pi pi-download' },
  { value: 'name', label: 'A to Z', icon: 'pi pi-sort-alpha-down' },
];

/**
 * /libraries — the health of the Angular libraries the hub tracks: a score out of 100 per library
 * for the latest major, which majors each supports, and the links to dig in. Filters live in the
 * URL (?search=&category=&major=&sort=); the API filters and pages.
 */
@Component({
  selector: 'hub-libraries-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    IconField,
    InputIcon,
    InputText,
    Select,
    PageHeader,
    ChipFilter,
    EmptyState,
    InfiniteScroll,
    LoadError,
    Loading,
    OptionCount,
    HealthBadge,
    ExperimentalBanner,
  ],
  template: `
    <hub-page-header
      icon="pi pi-box"
      eyebrow="Ecosystem"
      title="Library health"
      description="Does this library support the Angular you run, and is it safe to pick? A score out of 100 per library, from its versions, advisories and popularity."
    >
      <div hubHeaderActions class="flex flex-wrap gap-2 self-start shrink-0">
        <a class="hub-pixel-btn hub-pixel-btn-sm" routerLink="/libraries/check">
          <span><i class="pi pi-bolt" aria-hidden="true"></i> Check any package</span>
        </a>
        <a class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm" routerLink="/libraries/score">
          <span><i class="pi pi-question-circle" aria-hidden="true"></i> How the score works</span>
        </a>
      </div>
    </hub-page-header>

    <hub-experimental-banner class="mb-6 max-w-3xl" />

    <section aria-label="Filters" class="mb-8 space-y-3">
      <hub-chip-filter
        label="Sort"
        [options]="sortOptions"
        [value]="sort()"
        (valueChange)="params.set('sort', $event)"
      />
      <div class="filter-bar flex flex-wrap items-center gap-3">
        <p-iconfield class="w-full sm:w-72">
          <p-inputicon class="pi pi-search" />
          <input
            pInputText
            type="search"
            class="w-full"
            aria-label="Search libraries"
            placeholder="Search by name or purpose…"
            [ngModel]="search.input()"
            (ngModelChange)="search.set($event)"
          />
        </p-iconfield>
        @if (data(); as list) {
          <p-select
            [autofocus]="false"
            [options]="list.majors"
            optionLabel="label"
            optionValue="value"
            [ngModel]="major()"
            (onChange)="params.set('major', $event.value ?? '')"
            ariaLabel="Supports Angular version"
            styleClass="w-44"
          >
            <ng-template #item let-option
              ><hub-option-count [label]="option.label" [count]="option.count"
            /></ng-template>
          </p-select>
          <p-select
            [autofocus]="false"
            [options]="list.categories"
            optionLabel="label"
            optionValue="value"
            [ngModel]="category()"
            (onChange)="params.set('category', $event.value ?? '')"
            ariaLabel="Category"
            styleClass="w-52"
          >
            <ng-template #item let-option
              ><hub-option-count [label]="option.label" [count]="option.count"
            /></ng-template>
          </p-select>
        }
      </div>
    </section>

    @if (list.error()) {
      <hub-load-error what="the libraries" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <p class="mb-3 text-sm text-muted" [class.sr-only]="list.total === 0" aria-live="polite">
        {{ list.total }} {{ list.total === 1 ? 'library' : 'libraries' }}
        @if (major()) {
          with a version for Angular {{ major() }}
        }
      </p>
      @if (list.total === 0) {
        <hub-empty-state
          class="max-w-xl"
          icon="pi pi-search"
          title="No library found"
          [message]="emptyMessage()"
          hint="The hub tracks a curated list: a library you miss is one pull request away."
        >
          <p class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            @if (search.input().trim(); as term) {
              <a class="link" routerLink="/libraries/check" [queryParams]="{ package: term }"
                ><i class="pi pi-bolt text-xs" aria-hidden="true"></i> Check “{{ term }}” live</a
              >
            }
            <a
              class="link"
              href="https://github.com/openng-org/hub/blob/main/packages/data-libraries/data/libraries.json"
              target="_blank"
              rel="noopener noreferrer"
              >Add a library</a
            >
          </p>
        </hub-empty-state>
      } @else {
        <ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          @for (library of pages.items(); track library.name) {
            <li
              class="hub-card-link flex flex-col gap-3 rounded-border border border-surface p-4 hover:border-primary transition-colors"
            >
              <div class="flex items-start gap-3">
                <hub-health-badge
                  [badge]="library.score"
                  [context]="'of ' + library.name + ' for Angular ' + list.latestMajor"
                />
                <div class="min-w-0 flex-1">
                  <h2 class="font-semibold leading-snug break-all">
                    <a class="hub-card-link-target" [routerLink]="library.path">{{
                      library.name
                    }}</a>
                  </h2>
                  <p class="text-xs text-muted mt-0.5">
                    {{ library.categoryLabel }} · {{ library.downloads }}
                  </p>
                </div>
              </div>
              @if (library.description) {
                <p class="text-sm text-muted leading-relaxed line-clamp-2">
                  {{ library.description }}
                </p>
              }
              <div class="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                @for (dot of library.majors; track dot.major) {
                  <span
                    class="inline-flex items-center gap-1"
                    [class.text-muted]="!dot.version"
                    [title]="
                      dot.version
                        ? library.name + ' ' + dot.version + ' for Angular ' + dot.major
                        : 'No stable version for Angular ' + dot.major
                    "
                  >
                    <i
                      [class]="
                        dot.version ? 'pi pi-check-circle text-status-stable' : 'pi pi-minus-circle'
                      "
                      aria-hidden="true"
                    ></i>
                    <span class="sr-only">{{ dot.version ? 'Supports' : 'No version for' }}</span>
                    {{ dot.major }}
                  </span>
                }
                @if (library.warning; as warning) {
                  <span
                    class="ml-auto inline-flex items-center gap-1 font-medium text-status-deprecated"
                  >
                    <i class="pi pi-ban text-xs" aria-hidden="true"></i>
                    {{ warning === 'deprecated' ? 'Deprecated' : 'Archived' }}
                  </span>
                }
              </div>
            </li>
          }
        </ul>
        <hub-infinite-scroll class="mt-6" [pages]="pages" what="libraries" />
      }
    } @else {
      <hub-loading
        grid="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        [rows]="6"
        height="9rem"
        label="Loading libraries"
      />
    }
  `,
})
export default class LibrariesPage {
  private readonly get = injectApiGet();
  protected readonly params = injectQueryParams();

  protected readonly sortOptions = SORT_OPTIONS;

  private readonly sortParam = this.params.get('sort');
  protected readonly sort = computed(() =>
    this.sortParam() === 'downloads' || this.sortParam() === 'name' ? this.sortParam() : '',
  );
  protected readonly category = this.params.get('category');
  protected readonly major = this.params.get('major');
  protected readonly search = debouncedParam(this.params, 'search');
  private readonly searchTerm = this.params.get('search');

  private readonly query = computed<LibraryQuery>(() => ({
    search: this.searchTerm(),
    category: this.category(),
    major: this.major(),
    sort: (this.sort() || 'score') as LibrarySort,
  }));

  protected readonly list = httpResource<LibraryList>(() => apiUrl('libraries', this.query()));
  protected readonly data = latestValue(this.list);
  /** Further pages, loaded as the visitor scrolls; a filter change starts over. */
  protected readonly pages = pagedResource(
    this.list,
    (page) => this.get<LibraryList>(apiUrl('libraries', { ...this.query(), page })),
    (list) => list.items,
  );

  protected readonly emptyMessage = computed(() => {
    const { search, major } = this.query();
    const where = major ? ` with a version for Angular ${major}` : '';
    return search
      ? `No tracked library matches "${search}"${where}.`
      : `No tracked library matches these filters${where}.`;
  });

  constructor() {
    pageSeo({
      title: 'Angular library health: which libraries support your Angular version',
      description:
        'A health score for the popular Angular libraries: which Angular majors each supports, known vulnerabilities, popularity and maintenance, in one place.',
      path: '/libraries',
      image: '/og/libraries.png',
    });
  }
}
