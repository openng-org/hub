import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';
import { TagModule } from '@openng/optimus-ui/tag';

import {
  debouncedParam,
  injectQueryParams,
  latestValue,
  pagedResource,
} from '../../core/query-params';
import { pageSeo } from '../../core/seo';
import { PageHeader } from '../../layout/page-header';
import { ChipFilter, type ChipOption } from '../../ui/chip-filter';
import { EmptyState } from '../../ui/empty-state';
import { LoadError } from '../../ui/load-error';
import { Loading } from '../../ui/loading';
import { LogoFrame } from '../../ui/logo-frame';
import type { EventMonth, EventQuery, EventWhen } from '../data/api';
import { CommunityApi } from '../data/community-api';
import { EventsMap } from '../ui/events-map';

const WHEN_OPTIONS: ChipOption[] = [
  { value: '', label: 'Upcoming', icon: 'pi pi-calendar' },
  { value: 'past', label: 'Past', icon: 'pi pi-history' },
];
const TYPE_OPTIONS: ChipOption[] = [
  { value: '', label: 'All' },
  { value: 'conference', label: 'Conferences' },
  { value: 'meetup', label: 'Meetups' },
  { value: 'workshop', label: 'Workshops' },
];
const FORMAT_OPTIONS: ChipOption[] = [
  { value: '', label: 'Anywhere' },
  { value: 'in-person', label: 'In person', icon: 'pi pi-map-marker' },
  { value: 'online', label: 'Online', icon: 'pi pi-globe' },
  { value: 'hybrid', label: 'Hybrid', icon: 'pi pi-arrow-right-arrow-left' },
];

const VIEW_OPTIONS: ChipOption[] = [
  { value: '', label: 'List', icon: 'pi pi-list' },
  { value: 'map', label: 'Map', icon: 'pi pi-map' },
];

/**
 * /events — the Angular agenda: every event of the selection grouped by month, each with a pixel
 * calendar tile. Filters live in the URL
 * (?view=&when=&type=&format=&search=, ?region= on the map); the API does the filtering.
 */
@Component({
  selector: 'hub-events-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    TagModule,
    PageHeader,
    ChipFilter,
    EmptyState,
    LoadError,
    Loading,
    LogoFrame,
    EventsMap,
  ],
  template: `
    <hub-page-header
      icon="pi pi-calendar"
      title="Events"
      description="Conferences, meetups and workshops about Angular around the world — on site, online, or both."
    >
      <a class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm mt-5" routerLink="/contribute">
        <span><i class="pi pi-plus" aria-hidden="true"></i> Add your event</span>
      </a>
      <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span class="text-muted">Follow along:</span>
        <a class="link inline-flex items-center gap-1.5" href="/calendar/events.ics">
          <i class="pi pi-calendar-plus" aria-hidden="true"></i> Calendar (.ics)
        </a>
        <a class="link inline-flex items-center gap-1.5" href="/feed.xml">
          <i class="pi pi-wifi" aria-hidden="true"></i> RSS: events and calls for papers
        </a>
      </div>
    </hub-page-header>

    <section aria-label="Filters" class="mb-8 space-y-3">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <hub-chip-filter
          label="View"
          [options]="viewOptions"
          [value]="view()"
          (valueChange)="setView($event)"
        />
        <hub-chip-filter
          label="When"
          [options]="whenOptions"
          [value]="when() === 'past' ? 'past' : ''"
          (valueChange)="params.set('when', $event)"
        />
        <hub-chip-filter
          label="Event type"
          [options]="typeOptions"
          [value]="type()"
          (valueChange)="params.set('type', $event)"
        />
        <hub-chip-filter
          label="Format"
          [options]="formatOptions"
          [value]="format()"
          (valueChange)="params.set('format', $event)"
        />
      </div>
      <div class="filter-bar max-w-md">
        <p-iconfield>
          <p-inputicon class="pi pi-search" />
          <input
            pInputText
            type="search"
            class="w-full"
            aria-label="Search events"
            placeholder="Search by name, city or organizer…"
            [ngModel]="search.input()"
            (ngModelChange)="search.set($event)"
          />
        </p-iconfield>
      </div>
    </section>

    @if (view() === 'map') {
      @defer {
        <hub-events-map [query]="query()" />
      } @placeholder {
        <p-skeleton height="24rem" />
      }
    } @else if (list.error()) {
      <hub-load-error what="the events" (retry)="list.reload()" />
    } @else if (data(); as list) {
      @if (list.total === 0) {
        <hub-empty-state class="max-w-xl" title="No events here" [message]="emptyMessage()">
          <a class="link text-sm inline-block mt-3" routerLink="/contribute">Add an event</a>
        </hub-empty-state>
      } @else {
        <p class="text-sm text-muted mb-6">
          {{ list.total }} {{ list.total === 1 ? 'event' : 'events' }}
        </p>
        <div class="space-y-12">
          @for (month of months(); track month.key) {
            <section [attr.aria-labelledby]="'month-' + month.key">
              <h2
                [id]="'month-' + month.key"
                class="hub-page-title text-3xl mb-4 flex items-baseline gap-3"
              >
                {{ month.label }}
                <span class="text-base text-muted font-sans">{{ month.events.length }}</span>
                <span
                  class="flex-1 border-b-4 border-dotted border-surface"
                  aria-hidden="true"
                ></span>
              </h2>
              <ol class="space-y-3">
                @for (event of month.events; track event.key) {
                  <li
                    class="hub-card-link flex gap-4 rounded-border p-3 hover:bg-emphasis transition-colors"
                  >
                    <div class="hub-calendar-tile" aria-hidden="true">
                      <span class="hub-tile-month">{{ event.tile.month }}</span>
                      <span class="hub-tile-day">{{ event.tile.day }}</span>
                      <span class="hub-tile-weekday">{{ event.tile.weekday }}</span>
                    </div>
                    <div class="min-w-0 flex-1 grid gap-1 md:grid-cols-[1fr_auto] md:gap-4">
                      <div class="min-w-0">
                        <h3 class="font-semibold text-lg leading-snug">
                          @if (event.url) {
                            <a
                              class="hub-card-link-target"
                              [href]="event.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              >{{ event.name }}</a
                            >
                          } @else {
                            {{ event.name }}
                          }
                        </h3>
                        <p class="text-sm text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span class="inline-flex items-center gap-1.5">
                            <i
                              [class]="
                                event.format === 'online' ? 'pi pi-globe' : 'pi pi-map-marker'
                              "
                              aria-hidden="true"
                            ></i>
                            {{ event.place }}
                          </span>
                          <span>{{ event.dates }}</span>
                          @if (event.organizer; as organizer) {
                            <span class="inline-flex items-center gap-1.5">
                              <hub-logo-frame
                                [src]="organizer.logo"
                                [name]="organizer.name"
                                class="size-5 p-0.5!"
                              />
                              {{ organizer.name }}
                            </span>
                          }
                        </p>
                        @if (event.cfp; as cfp) {
                          <a
                            class="hub-card-link-above link text-sm inline-flex items-center gap-1.5 mt-1"
                            [href]="cfp.url"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i class="pi pi-megaphone" aria-hidden="true"></i>
                            Call for papers open{{ cfp.due ? ' until ' + cfp.due : '' }}
                          </a>
                        }
                      </div>
                      <div class="flex flex-wrap md:flex-col md:items-end gap-1.5 md:text-right">
                        <span
                          class="text-sm font-medium"
                          [class.text-primary]="when() === 'upcoming'"
                          [class.text-muted]="when() === 'past'"
                          >{{ event.relative }}</span
                        >
                        <div class="flex flex-wrap gap-1.5 md:justify-end">
                          <p-tag [value]="event.typeLabel" severity="secondary" />
                          <p-tag
                            [value]="event.formatLabel"
                            [severity]="event.format === 'online' ? 'info' : 'secondary'"
                          />
                          @if (event.price; as price) {
                            <p-tag
                              [value]="price"
                              [severity]="price === 'Free' ? 'success' : 'secondary'"
                            />
                          }
                        </div>
                        <span class="text-xs text-muted">{{ event.language }}</span>
                      </div>
                    </div>
                  </li>
                }
              </ol>
            </section>
          }
        </div>

        @if (pages.hasMore()) {
          <div class="flex flex-col items-center gap-2 py-8">
            @if (pages.error()) {
              <span class="text-sm text-muted" role="alert">Older events could not be loaded.</span>
            }
            <p-button
              [label]="pages.error() ? 'Try again' : 'Older events'"
              icon="pi pi-chevron-down"
              [outlined]="true"
              [loading]="pages.loading()"
              (onClick)="pages.loadMore()"
            />
          </div>
        }
      }
    } @else {
      <hub-loading height="6rem" label="Loading events" />
    }
  `,
})
export default class EventsPage {
  private readonly api = inject(CommunityApi);
  protected readonly params = injectQueryParams();

  protected readonly viewOptions = VIEW_OPTIONS;
  protected readonly whenOptions = WHEN_OPTIONS;
  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly formatOptions = FORMAT_OPTIONS;

  private readonly whenParam = this.params.get('when');
  protected readonly when = computed<EventWhen>(() =>
    this.whenParam() === 'past' ? 'past' : 'upcoming',
  );
  protected readonly type = this.params.get('type');
  protected readonly format = this.params.get('format');
  private readonly viewParam = this.params.get('view');
  protected readonly view = computed(() => (this.viewParam() === 'map' ? 'map' : ''));
  protected readonly search = debouncedParam(this.params, 'search');
  private readonly searchTerm = this.params.get('search');

  protected readonly query = computed<EventQuery>(() => ({
    when: this.when(),
    type: this.type(),
    format: this.format(),
    search: this.searchTerm(),
  }));

  /** The list is not loaded while the map is shown. */
  protected readonly list = resource({
    params: () => (this.view() === 'map' ? undefined : this.query()),
    loader: ({ params }) => this.api.events(params),
  });
  protected readonly data = latestValue(this.list);
  /** Older pages, loaded with "Older events" (past only). */
  protected readonly pages = pagedResource(
    this.list,
    (page) => this.api.events({ ...this.query(), page }),
    (list) => list.months,
  );

  /** Months of every loaded page; a month split across pages is merged back. */
  protected readonly months = computed(() => {
    const merged: EventMonth[] = [];
    for (const month of this.pages.items()) {
      const last = merged[merged.length - 1];
      if (last?.key === month.key) last.events = [...last.events, ...month.events];
      else merged.push({ ...month });
    }
    return merged;
  });

  protected readonly emptyMessage = computed(
    () =>
      `Nothing matches these filters${this.when() === 'upcoming' ? ' yet' : ''}. Know an Angular event that is missing? Add it to the dataset with a pull request.`,
  );

  constructor() {
    pageSeo(() => ({
      title: 'Angular events: conferences, meetups and workshops',
      description:
        'Upcoming Angular conferences, meetups and workshops around the world, on site and online, with their calls for papers.',
      path: '/events',
      image: '/og/events.png',
      jsonLd: this.data()?.jsonLd ?? null,
    }));
  }

  /** The map has its own region filter, which the list does not use. */
  protected setView(view: string): void {
    this.params.patch({ view, region: '' });
  }
}
