import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconField } from '@openng/optimus-ui/iconfield';
import { InputIcon } from '@openng/optimus-ui/inputicon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { Tag } from '@openng/optimus-ui/tag';

import { apiUrl, injectApiGet } from '../../../core/api/api.utils';
import type { EventList } from '../community.model';
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
import { LogoFrame } from '../../../shared/components/logo-frame';
import type { EventMonth, EventQuery, EventWhen } from '../community.model';
import { EventsMap } from '../components/events-map';

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
    IconField,
    InputIcon,
    InputText,
    Skeleton,
    Tag,
    PageHeader,
    ChipFilter,
    EmptyState,
    LoadError,
    Loading,
    LogoFrame,
    EventsMap,
    InfiniteScroll,
  ],
  template: `
    <hub-page-header
      icon="pi pi-calendar"
      title="Events"
      description="Conferences, meetups and workshops about Angular around the world — on site, online, or both."
    >
      <div hubHeaderActions class="flex flex-col items-start gap-4 lg:items-end shrink-0">
        <a class="hub-pixel-btn hub-pixel-btn-sm" routerLink="/contribute">
          <span><i class="pi pi-plus" aria-hidden="true"></i> Add your event</span>
        </a>
        <div class="flex flex-wrap gap-3 lg:justify-end">
          <a
            class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm"
            href="/calendar/events.ics"
            title="Subscribe to every upcoming event in your calendar app"
          >
            <span><i class="pi pi-calendar-plus" aria-hidden="true"></i> Calendar</span>
          </a>
          <a
            class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm"
            href="/feed.xml"
            title="RSS feed of upcoming events and open calls for papers"
          >
            <span><i class="pi pi-wifi" aria-hidden="true"></i> RSS</span>
          </a>
        </div>
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

        <hub-infinite-scroll class="mt-6" [pages]="pages" what="events" height="6rem" />
      }
    } @else {
      <hub-loading height="6rem" label="Loading events" />
    }
  `,
})
export default class EventsPage {
  private readonly get = injectApiGet();
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
  protected readonly list = httpResource<EventList>(() =>
    this.view() === 'map' ? undefined : apiUrl('community/events', this.query()),
  );
  protected readonly data = latestValue(this.list);
  /** Older pages, loaded as the visitor scrolls (past only). */
  protected readonly pages = pagedResource(
    this.list,
    (page) => this.get<EventList>(apiUrl('community/events', { ...this.query(), page })),
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
