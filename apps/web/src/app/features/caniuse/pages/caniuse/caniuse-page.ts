import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TabsModule } from '@openng/optimus-ui/tabs';
import { BadgeModule } from '@openng/optimus-ui/badge';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';

import { debouncedParam, injectQueryParams } from '../../../../core/utils/query-params.utils';
import { pageSeo } from '../../../../core/services/seo';
import { PageHeader } from '../../../../core/layout/page-header';
import type { CaniuseSummary } from '../../caniuse.model';
import { CaniuseApi } from '../../caniuse-api';
import { EslintTab } from './tabs/eslint-tab';
import { FeaturesTab } from './tabs/features-tab';
import { McpTab } from './tabs/mcp-tab';
import { UpdateTab } from './tabs/update-tab';
import { OptionCount } from '../../../../shared/components/option-count';

const TAB_VALUES = ['features', 'update', 'mcp', 'eslint'] as const;
export type TabValue = (typeof TAB_VALUES)[number];

const TABS: Record<TabValue, { label: string; path: string; title: string; description: string }> =
  {
    features: {
      label: 'Features',
      path: '/caniuse',
      title: 'Angular Can I Use: feature support per version',
      description:
        'Every Angular feature with its status in each version, from experimental to removed, plus ng update migrations, MCP server tools and angular-eslint rules.',
    },
    update: {
      label: 'NG Update',
      path: '/caniuse/update',
      title: 'NG Update: the migrations each Angular version runs',
      description:
        'Every ng update migration by Angular version and repository, with what it rewrites, before/after examples and links to the source.',
    },
    mcp: {
      label: 'MCP',
      path: '/caniuse/mcp',
      title: 'Angular MCP server: tools and resources per version',
      description:
        'What the Angular CLI MCP server offers in each version: tools and resources, their status, and when they landed.',
    },
    eslint: {
      label: 'ESLint',
      path: '/caniuse/eslint',
      title: 'angular-eslint rules and the version they landed in',
      description:
        'Every angular-eslint rule with its type and the version that introduced it, searchable, with links to the documentation.',
    },
  };

const isTab = (value: string): value is TabValue =>
  (TAB_VALUES as readonly string[]).includes(value);

/**
 * Angular Can I Use: one route per tab (/caniuse, /caniuse/update, /mcp, /eslint), the global
 * search and the URL-backed filters (?search=&package=&status=&type=). Each tab asks the API for
 * its own view of the current search; the route resolves the summary (badge totals, packages).
 */
@Component({
  selector: 'hub-caniuse-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TabsModule,
    BadgeModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
    FeaturesTab,
    UpdateTab,
    McpTab,
    EslintTab,
    PageHeader,
    OptionCount,
  ],
  template: `
    <hub-page-header
      icon="pi pi-flask"
      title="Can I Use"
      description="Explore Angular features, ng update migrations, MCP server features and ESLint rules — all in one place."
    />

    <div class="filter-bar mb-6 max-w-xl">
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input
          pInputText
          type="search"
          class="w-full"
          aria-label="Search across all lists"
          placeholder="Search across all lists..."
          [ngModel]="search.input()"
          (ngModelChange)="search.set($event)"
        />
        @if (search.input()) {
          <p-inputicon>
            <button
              type="button"
              class="pi pi-times cursor-pointer text-muted hover:text-color"
              aria-label="Clear search"
              (click)="search.set('')"
            ></button>
          </p-inputicon>
        }
      </p-iconfield>
    </div>

    <!-- Narrow screens: a select instead of the tab strip -->
    <div class="md:hidden mb-6">
      <p-select
        [autofocus]="false"
        [options]="tabOptions()"
        optionLabel="label"
        optionValue="value"
        [ngModel]="tab()"
        (onChange)="goToTab($event.value)"
        ariaLabel="Select list"
        styleClass="w-full"
      >
        <ng-template #selectedItem let-option>
          <hub-option-count [label]="option.label" [count]="option.count" />
        </ng-template>
        <ng-template #item let-option>
          <hub-option-count [label]="option.label" [count]="option.count" />
        </ng-template>
      </p-select>
    </div>

    <p-tabs [value]="tab()" (valueChange)="goToTab($event)" [lazy]="true" class="hub-pixel-frame">
      <p-tablist class="hidden md:block p-6">
        @for (value of tabValues; track value) {
          <p-tab [value]="value" class="flex items-center gap-2">
            {{ tabs[value].label }}
            <p-badge
              [value]="counts()[value] ?? '…'"
              [severity]="tab() === value ? null : 'secondary'"
            />
          </p-tab>
        }
      </p-tablist>
      <p-tabpanels class="p-0!">
        <!-- #content templates: a panel instantiates its tab only once shown (projected content
             would be created eagerly, even on the server). -->
        <p-tabpanel value="features">
          <ng-template #content>
            <hub-features-tab
              [packages]="summary().packages"
              [search]="searchTerm()"
              [packageFilter]="packageFilter()"
              [statusFilter]="statusFilter()"
              (packageFilterChange)="params.set('package', $event)"
              (statusFilterChange)="params.set('status', $event)"
              (matchCountChange)="featureMatches.set($event)"
            />
          </ng-template>
        </p-tabpanel>
        <p-tabpanel value="update">
          <ng-template #content>
            <!-- @defer: the tree table (and the paginator/scroller it imports) loads with this tab only. -->
            @defer {
              <hub-update-tab [search]="searchTerm()" />
            } @placeholder {
              <div class="px-6 py-4"><p-skeleton height="2.5rem" width="16rem" /></div>
            }
          </ng-template>
        </p-tabpanel>
        <p-tabpanel value="mcp">
          <ng-template #content>
            <hub-mcp-tab [search]="searchTerm()" />
          </ng-template>
        </p-tabpanel>
        <p-tabpanel value="eslint">
          <ng-template #content><hub-eslint-tab [search]="searchTerm()" /></ng-template>
        </p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  `,
})
export default class CaniusePage {
  /** Resolved by the route (see app.routes.ts). */
  readonly summary = input.required<CaniuseSummary>();
  /** The route's tab (app.routes.ts `data`). */
  readonly tab = input<TabValue>('features');

  private readonly router = inject(Router);
  private readonly api = inject(CaniuseApi);
  protected readonly params = injectQueryParams();

  protected readonly tabValues = TAB_VALUES;
  protected readonly tabs = TABS;

  protected readonly search = debouncedParam(this.params, 'search');
  protected readonly searchTerm = this.params.get('search');
  protected readonly packageFilter = this.params.get('package');
  protected readonly statusFilter = this.params.get('status');

  /** Features matching search and filters, reported by the Features tab (null while loading). */
  protected readonly featureMatches = signal<number | null>(null);

  /** Matches per tab for the current search; without a search, the summary totals apply. */
  private readonly searchCounts = resource({
    params: () => this.searchTerm() || undefined,
    loader: ({ params }) => this.api.counts(params),
  });

  protected readonly counts = computed<Record<TabValue, number | null>>(() => {
    const totals = this.searchTerm()
      ? this.searchCounts.hasValue()
        ? this.searchCounts.value()
        : undefined
      : this.summary().counts;
    return {
      features: this.featureMatches() ?? totals?.features ?? null,
      update: totals?.migrations ?? null,
      mcp: totals?.mcp ?? null,
      eslint: totals?.eslint ?? null,
    };
  });

  protected readonly tabOptions = computed(() =>
    TAB_VALUES.map((value) => ({
      value,
      label: TABS[value].label,
      count: this.counts()[value],
    })),
  );

  constructor() {
    pageSeo(() => {
      const tab = TABS[this.tab()];
      return {
        title: tab.title,
        description: tab.description,
        path: tab.path,
        image: '/og/caniuse.png',
      };
    });
    // Links from before the tabs were routes: /caniuse?tab=update → /caniuse/update.
    const legacy = this.params.get('tab')();
    if (legacy && isTab(legacy)) {
      void this.router.navigate([TABS[legacy].path], {
        queryParams: { tab: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  /** Another tab, same search and filters. */
  protected goToTab(value: string | number | undefined): void {
    const tab = isTab(String(value ?? '')) ? (value as TabValue) : 'features';
    if (tab === this.tab()) return;
    void this.router.navigate([TABS[tab].path], { queryParamsHandling: 'preserve' });
  }
}
