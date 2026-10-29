import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { apiUrl } from '../../../core/api/api.utils';
import type { EventMap } from '../community.model';
import { injectQueryParams, latestValue } from '../../../core/utils/query-params.utils';
import { ChipFilter, type ChipOption } from '../../../shared/components/chip-filter';
import { LoadError } from '../../../shared/components/load-error';
import { LogoFrame } from '../../../shared/components/logo-frame';
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type EventQuery,
  type MapPlace,
  type MapRegion,
} from '../community.model';
import { WORLD_LAND } from './world-land';

/**
 * The events of the current filters on a pixel world map: a marker per city (bigger with more
 * events), region chips to zoom in (?region=), and the selected city's events beside the map. The
 * places are also listed as buttons under the map, so everything works without pointing at it.
 */
@Component({
  selector: 'hub-events-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChipFilter, LoadError, LogoFrame],
  host: { class: 'block' },
  template: `
    @if (map.error()) {
      <hub-load-error what="the map" (retry)="map.reload()" />
    } @else if (data(); as map) {
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        <hub-chip-filter
          label="Region"
          [options]="regionOptions()"
          [value]="region()?.value ?? ''"
          (valueChange)="params.set('region', $event)"
        />
        <span class="text-sm text-muted">
          {{ map.onMap }} on site{{
            map.online ? ' · ' + map.online + ' online only, not on the map' : ''
          }}
        </span>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="hub-map hub-pixel-frame p-2 min-w-0 self-start">
          <svg
            class="block w-full h-auto"
            [attr.viewBox]="viewBox()"
            [style.aspect-ratio]="aspect"
            preserveAspectRatio="xMidYMid meet"
            role="group"
            aria-label="World map of Angular events"
          >
            <defs>
              <pattern id="hub-map-land" width="1" height="1" patternUnits="userSpaceOnUse">
                <rect class="hub-map-land" x="0.1" y="0.1" width="0.8" height="0.8" />
              </pattern>
            </defs>
            <path [attr.d]="land" fill="url(#hub-map-land)" />
            @for (place of map.places; track place.key) {
              @let size = (region()?.markerSize ?? 3) * place.scale;
              <g
                class="hub-map-marker"
                [class.is-selected]="place.key === selected()?.key"
                role="button"
                tabindex="0"
                [attr.aria-label]="
                  place.label + ', ' + place.count + (place.count === 1 ? ' event' : ' events')
                "
                [attr.aria-pressed]="place.key === selected()?.key"
                (click)="select(place)"
                (keydown.enter)="select(place)"
                (keydown.space)="$event.preventDefault(); select(place)"
              >
                <title>{{ place.label }} — {{ place.count }}</title>
                <rect
                  class="hub-map-marker-shadow"
                  [attr.x]="place.x - size / 2 + size * 0.2"
                  [attr.y]="place.y - size / 2 + size * 0.2"
                  [attr.width]="size"
                  [attr.height]="size"
                />
                <rect
                  class="hub-map-marker-body"
                  [attr.x]="place.x - size / 2"
                  [attr.y]="place.y - size / 2"
                  [attr.width]="size"
                  [attr.height]="size"
                />
                @if (zoomed()) {
                  <text
                    class="hub-map-marker-count"
                    [attr.x]="place.x"
                    [attr.y]="place.y + size * 0.28"
                    [attr.font-size]="size * 0.75"
                    text-anchor="middle"
                    aria-hidden="true"
                  >
                    {{ place.count }}
                  </text>
                }
              </g>
            }
          </svg>
        </div>

        <aside class="min-w-0" aria-live="polite">
          @if (selected(); as place) {
            <h2 class="hub-page-title text-3xl leading-none">{{ place.label }}</h2>
            <p class="text-sm text-muted mt-1 mb-4">
              {{ place.count }} {{ place.count === 1 ? 'event' : 'events' }}
            </p>
            <ol class="space-y-2 lg:max-h-[26rem] lg:overflow-y-auto pr-1">
              @for (event of place.events; track event.key) {
                <li
                  class="hub-card-link flex gap-3 rounded-border p-2 hover:bg-emphasis transition-colors"
                >
                  <span class="hub-map-date" aria-hidden="true">
                    <span>{{ event.tile.month }}</span
                    >{{ event.tile.day }}
                  </span>
                  <span class="min-w-0">
                    @if (event.url) {
                      <a
                        class="hub-card-link-target font-medium leading-snug block"
                        [href]="event.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ event.name }}</a
                      >
                    } @else {
                      <span class="font-medium leading-snug block">{{ event.name }}</span>
                    }
                    <span class="text-xs text-muted flex flex-wrap items-center gap-x-2">
                      <span>{{ event.dates }}</span>
                      @if (event.organizer; as organizer) {
                        <span class="inline-flex items-center gap-1">
                          <hub-logo-frame
                            [src]="organizer.logo"
                            [name]="organizer.name"
                            class="size-4 p-0!"
                          />
                          {{ organizer.name }}
                        </span>
                      }
                    </span>
                  </span>
                </li>
              }
            </ol>
          } @else {
            <div class="hub-pixel-box text-center py-8">
              <p class="hub-page-title text-3xl mb-2">No events here</p>
              <p class="text-sm text-muted">Nothing on site matches these filters.</p>
            </div>
          }
        </aside>
      </div>

      @if (visiblePlaces().length > 0) {
        <div class="mt-6">
          <h2 class="text-sm font-medium text-muted mb-2" id="map-places">Cities</h2>
          <div class="hub-chips" role="group" aria-labelledby="map-places">
            @for (place of visiblePlaces(); track place.key) {
              <button
                type="button"
                [attr.aria-pressed]="place.key === selected()?.key"
                (click)="select(place)"
              >
                {{ place.label }}
                <span class="hub-chip-count">{{ place.count }}</span>
              </button>
            }
          </div>
        </div>
      }
    } @else {
      <div
        class="hub-map hub-pixel-frame"
        [style.aspect-ratio]="aspect"
        aria-busy="true"
        aria-label="Loading the map"
      ></div>
    }
  `,
})
export class EventsMap {
  /** The events page's filters (when, type, format, search). */
  readonly query = input.required<EventQuery>();

  protected readonly params = injectQueryParams();
  private readonly regionParam = this.params.get('region');

  protected readonly land = WORLD_LAND;
  protected readonly aspect = `${WORLD_WIDTH} / ${WORLD_HEIGHT}`;

  protected readonly map = httpResource<EventMap>(() =>
    apiUrl('community/events/map', this.query()),
  );
  protected readonly data = latestValue(this.map);

  protected readonly region = computed<MapRegion | undefined>(() => {
    const regions = this.data()?.regions ?? [];
    return regions.find((r) => r.value === this.regionParam()) ?? regions[0];
  });
  protected readonly zoomed = computed(() => !!this.region()?.value);
  protected readonly viewBox = computed(() =>
    (this.region()?.view ?? [0, 0, WORLD_WIDTH, WORLD_HEIGHT]).join(' '),
  );

  protected readonly regionOptions = computed<ChipOption[]>(() =>
    (this.data()?.regions ?? []).map((r) => ({ value: r.value, label: r.label, count: r.count })),
  );

  /** Places of the selected region, busiest first. */
  protected readonly visiblePlaces = computed(() => {
    const value = this.region()?.value;
    return (this.data()?.places ?? [])
      .filter((place) => !value || place.region === value)
      .slice()
      .reverse();
  });

  /** The busiest place of the region until another one is picked. */
  protected readonly selected = linkedSignal<MapPlace[], MapPlace | undefined>({
    source: this.visiblePlaces,
    computation: (places, previous) =>
      places.find((place) => place.key === previous?.value?.key) ?? places[0],
  });

  protected select(place: MapPlace): void {
    this.selected.set(place);
  }
}
