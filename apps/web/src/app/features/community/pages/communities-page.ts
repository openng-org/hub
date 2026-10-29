import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

import {
  debouncedParam,
  injectQueryParams,
  latestValue,
} from '../../../core/utils/query-params.utils';
import { pageSeo } from '../../../core/services/seo';
import { PageHeader } from '../../../core/layout/page-header';
import { EmptyState } from '../../../shared/components/empty-state';
import { LoadError } from '../../../shared/components/load-error';
import { Loading } from '../../../shared/components/loading';
import { LogoFrame } from '../../../shared/components/logo-frame';
import { OptionCount } from '../../../shared/components/option-count';
import type { CommunityQuery } from '../community.model';
import { CommunityApi } from '../community-api';

/**
 * /communities — who brings Angular developers together: a card per community, the
 * ones with an upcoming event first (with a "next" ribbon). Filters live in the URL
 * (?country=&search=); the API does the filtering.
 */
@Component({
  selector: 'hub-communities-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    PageHeader,
    EmptyState,
    LoadError,
    Loading,
    LogoFrame,
    OptionCount,
  ],
  template: `
    <hub-page-header
      icon="pi pi-users"
      title="Communities"
      description="The meetups and conferences bringing Angular developers together — find one near you, or online."
    >
      <a
        hubHeaderActions
        class="hub-pixel-btn hub-pixel-btn-sm self-start shrink-0"
        routerLink="/contribute"
        [queryParams]="{ kind: 'community' }"
      >
        <span><i class="pi pi-plus" aria-hidden="true"></i> Add your community</span>
      </a>
    </hub-page-header>

    <section aria-label="Filters" class="filter-bar mb-8 flex flex-wrap items-center gap-3">
      <p-select
        [autofocus]="false"
        [options]="countryOptions()"
        optionLabel="label"
        optionValue="value"
        [ngModel]="country()"
        (onChange)="params.set('country', $event.value ?? '')"
        placeholder="All countries"
        [showClear]="true"
        [filter]="true"
        ariaLabel="Filter by country"
        styleClass="w-52"
      >
        <ng-template #item let-option>
          <hub-option-count [label]="option.label" [count]="option.count" />
        </ng-template>
      </p-select>
      <p-iconfield class="w-full sm:w-72">
        <p-inputicon class="pi pi-search" />
        <input
          pInputText
          type="search"
          class="w-full"
          aria-label="Search communities"
          placeholder="Search by name or city…"
          [ngModel]="search.input()"
          (ngModelChange)="search.set($event)"
        />
      </p-iconfield>
    </section>

    @if (list.error()) {
      <hub-load-error what="the communities" (retry)="list.reload()" />
    } @else if (data(); as list) {
      @if (list.total === 0) {
        <hub-empty-state
          class="max-w-xl"
          title="Nobody here yet"
          message="No community matches these filters. Running one? Add it to the dataset with a pull request."
        >
          <a
            class="link text-sm inline-block mt-3"
            routerLink="/contribute"
            [queryParams]="{ kind: 'community' }"
            >Add your community</a
          >
        </hub-empty-state>
      } @else {
        <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (community of list.items; track community.id) {
            <li
              class="hub-card-link flex flex-col rounded-border border border-surface overflow-hidden hover:border-primary transition-colors"
            >
              @if (community.next; as next) {
                <div
                  class="bg-primary text-primary-contrast px-4 py-1.5 text-sm flex items-center gap-2 min-w-0"
                >
                  <!-- No leading on the pixel font, so both texts centre on the same line. -->
                  <span class="font-brand text-base leading-none tracking-widest shrink-0"
                    >NEXT</span
                  >
                  <span class="truncate leading-5">{{ next.relative }} · {{ next.name }}</span>
                </div>
              }
              <div class="p-4 flex gap-4 flex-1">
                <hub-logo-frame [src]="community.logo" [name]="community.name" class="size-16" />
                <div class="min-w-0 flex-1">
                  <h2 class="font-semibold text-lg leading-snug">
                    @if (community.url; as main) {
                      <a
                        class="hub-card-link-target"
                        [href]="main"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ community.name }}</a
                      >
                    } @else {
                      {{ community.name }}
                    }
                  </h2>
                  <p class="text-sm text-muted flex items-center gap-1.5 mt-0.5">
                    <i class="pi pi-map-marker text-xs" aria-hidden="true"></i>
                    {{ community.location ?? 'Online' }}
                  </p>
                  <div class="flex flex-wrap items-center gap-1.5 mt-2">
                    @if (community.eventCount > 0) {
                      <span class="text-xs text-muted"
                        >{{ community.eventCount }}
                        {{ community.eventCount === 1 ? 'event' : 'events' }} listed</span
                      >
                    }
                  </div>
                </div>
              </div>
              @if (community.links.length > 0 || community.callForPapersUrl) {
                <div
                  class="hub-card-link-above flex items-center gap-1 px-3 py-2 border-t border-surface"
                >
                  @for (link of community.links; track link.url) {
                    <a
                      [href]="link.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="size-8 inline-grid place-items-center rounded-border text-muted hover:text-primary hover:bg-emphasis transition-colors"
                      [attr.aria-label]="community.name + ' — ' + link.label"
                      [pTooltip]="link.label"
                      tooltipPosition="top"
                    >
                      <i [class]="link.icon" aria-hidden="true"></i>
                    </a>
                  }
                  @if (community.callForPapersUrl; as cfp) {
                    <a
                      [href]="cfp"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="link text-sm ml-auto inline-flex items-center gap-1.5 pr-1"
                    >
                      <i class="pi pi-megaphone" aria-hidden="true"></i>
                      Speak here
                    </a>
                  }
                </div>
              }
            </li>
          }
        </ul>
      }
    } @else {
      <hub-loading
        grid="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        [rows]="6"
        height="9rem"
        label="Loading communities"
      />
    }
  `,
})
export default class CommunitiesPage {
  private readonly api = inject(CommunityApi);
  protected readonly params = injectQueryParams();

  protected readonly country = this.params.get('country');
  protected readonly search = debouncedParam(this.params, 'search');
  private readonly searchTerm = this.params.get('search');

  protected readonly list = resource({
    params: computed<CommunityQuery>(() => ({
      country: this.country(),
      search: this.searchTerm(),
    })),
    loader: ({ params }) => this.api.communities(params),
  });
  protected readonly data = latestValue(this.list);

  protected readonly countryOptions = computed(() =>
    (this.data()?.countries ?? []).map(({ name, count }) => ({
      label: name,
      value: name,
      count,
    })),
  );

  constructor() {
    pageSeo({
      title: 'Angular communities',
      description:
        'Angular meetups and communities worldwide: find one near you or online, see when they meet next, and speak there.',
      path: '/communities',
      image: '/og/communities.png',
    });
  }
}
