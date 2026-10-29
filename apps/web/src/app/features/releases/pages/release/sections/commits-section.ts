import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconField } from '@openng/optimus-ui/iconfield';
import { InputIcon } from '@openng/optimus-ui/inputicon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';

import { apiUrl, injectApiGet } from '../../../../../core/api/api.utils';
import type { ReleaseCommits } from '../../../releases.model';
import {
  debouncedParam,
  injectQueryParams,
  latestValue,
  pagedResource,
} from '../../../../../core/utils/query-params.utils';
import { EmptyState } from '../../../../../shared/components/empty-state';
import { InfiniteScroll } from '../../../../../shared/components/infinite-scroll';
import { OptionCount } from '../../../../../shared/components/option-count';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import type { CommitQuery } from '../../../releases.model';
import { SectionHeader } from '../../../components/section-header';
import { CommitList } from '../../../components/commit-list';

/**
 * /releases/:version/commits — every commit of the major's stable releases, newest first, 50 at a
 * time. Filters live in the URL (?search=&type=&package=&version=); the API does the filtering.
 */
@Component({
  selector: 'hub-commits-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IconField,
    InputIcon,
    InputText,
    Select,
    EmptyState,
    LoadError,
    Loading,
    SectionHeader,
    CommitList,
    RouterLink,
    InfiniteScroll,
    OptionCount,
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
          <p-select
            [autofocus]="false"
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
              ><hub-option-count [label]="option.label" [count]="option.count"
            /></ng-template>
          </p-select>
          <a
            class="link text-sm inline-flex items-center gap-1.5"
            routerLink="/releases/commits"
            [queryParams]="search.input() ? { search: search.input() } : {}"
          >
            <i class="pi pi-search" aria-hidden="true"></i> Search every release
          </a>
        </div>
      </hub-section-header>

      @if (list.total === 0) {
        <hub-empty-state title="No commits" message="No commit matches these filters." />
      } @else {
        <hub-commit-list [commits]="pages.items()" />
        <hub-infinite-scroll [pages]="pages" what="commits" />
      }
    } @else {
      <hub-loading height="2.5rem" [rows]="3" label="Loading commits" />
    }
  `,
})
export default class CommitsSection {
  readonly version = input.required<string>();

  private readonly get = injectApiGet();
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

  protected readonly list = httpResource<ReleaseCommits>(() => {
    const { major, filters } = this.query();
    return apiUrl(`releases/${major}/commits`, filters);
  });
  protected readonly data = latestValue(this.list);
  /** Further pages, loaded as the visitor scrolls; a filter change starts over. */
  protected readonly pages = pagedResource(
    this.list,
    (page) => {
      const { major, filters } = this.query();
      return this.get<ReleaseCommits>(apiUrl(`releases/${major}/commits`, { ...filters, page }));
    },
    (list) => list.items,
  );
}
