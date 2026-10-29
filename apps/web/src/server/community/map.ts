import { places } from '@openng/data-community';

import {
  WORLD_HEIGHT,
  WORLD_LAT_TOP,
  WORLD_WIDTH,
  type EventMap,
  type EventQuery,
  type EventWhen,
  type MapPlace,
  type MapRegion,
} from '../../app/community/data/api';
import { todayIso } from './dates';
import { matchingEvents, toCard } from './events';

interface RegionBox {
  value: string;
  label: string;
  /** Longitudes and latitudes a place must fall in to belong to the region. */
  lng: [number, number];
  lat: [number, number];
  /** What the map shows when the region is selected: x, y, width, height in map units. */
  view: [number, number, number, number];
}

/** Checked in order: a place belongs to the first region that contains it. */
const REGIONS: RegionBox[] = [
  { value: 'europe', label: 'Europe', lng: [-30, 50], lat: [34, 72], view: [150, 12, 88, 34] },
  {
    value: 'americas',
    label: 'Americas',
    lng: [-170, -30],
    lat: [-60, 75],
    view: [45, 18, 115, 104],
  },
  {
    value: 'africa-middle-east',
    label: 'Africa & Middle East',
    lng: [-20, 65],
    lat: [-40, 40],
    view: [158, 34, 86, 86],
  },
  {
    value: 'asia-pacific',
    label: 'Asia & Pacific',
    lng: [65, 180],
    lat: [-50, 60],
    view: [238, 22, 112, 108],
  },
];

const WORLD: [number, number, number, number] = [0, 0, WORLD_WIDTH, WORLD_HEIGHT];

/** Marker side in map units for a view: about 1% of its width, never under one cell. */
const markerSize = (view: [number, number, number, number]) =>
  Math.round(Math.max(1, view[2] / 100) * 10) / 10;

function regionOf(lat: number, lng: number): string {
  return (
    REGIONS.find((r) => lng >= r.lng[0] && lng <= r.lng[1] && lat >= r.lat[0] && lat <= r.lat[1])
      ?.value ?? 'world'
  );
}

/**
 * On-site events of the selection on the world map: one marker per location (x, y in map units:
 * 1 unit = 1°), the regions to zoom on with their counts, and how many events have no place on the
 * map (online only).
 */
export function eventMap(query: EventQuery = {}, today = todayIso()): EventMap {
  const when: EventWhen = query.when === 'past' ? 'past' : 'upcoming';
  const matching = matchingEvents(query, today);
  const byPlace = new Map<string, MapPlace>();
  let online = 0;

  for (const event of matching) {
    const coordinates = event.isOnsite && event.location ? places[event.location] : undefined;
    if (!coordinates) {
      online++;
      continue;
    }
    const [lat, lng] = coordinates;
    let place = byPlace.get(event.location!);
    if (!place) {
      place = {
        key: event.location!,
        label: event.location!,
        x: Math.round((lng + 180) * 100) / 100,
        y: Math.round((WORLD_LAT_TOP - lat) * 100) / 100,
        region: regionOf(lat, lng),
        count: 0,
        scale: 1,
        events: [],
      };
      byPlace.set(place.key, place);
    }
    place.count++;
    place.events.push(toCard(event, today));
  }

  const placed = [...byPlace.values()].map((place) => ({
    ...place,
    scale: place.count >= 10 ? 1.8 : place.count >= 3 ? 1.4 : 1,
  }));
  // Busiest last, so their markers draw on top.
  placed.sort((a, b) => a.count - b.count || a.label.localeCompare(b.label));

  const onMap = placed.reduce((sum, place) => sum + place.count, 0);
  const regions: MapRegion[] = [
    { value: '', label: 'World', count: onMap, view: WORLD, markerSize: markerSize(WORLD) },
    ...REGIONS.map((region) => ({
      value: region.value,
      label: region.label,
      count: placed
        .filter((place) => place.region === region.value)
        .reduce((sum, place) => sum + place.count, 0),
      view: region.view,
      markerSize: markerSize(region.view),
    })).filter((region) => region.count > 0),
  ];

  return { when, places: placed, onMap, online, regions };
}
