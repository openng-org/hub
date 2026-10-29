import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ReleaseTimeline } from '../home.model';

/**
 * Every Angular major on a pixel track, from Angular 2 to the end of the newest major's long-term
 * support: a marker per release (its colour and label give its support status), the active and LTS
 * windows of the supported majors under it, and a "you are here" marker on today. The canvas keeps a
 * minimum width and scrolls sideways on small screens, opening on today.
 */
@Component({
  selector: 'hub-release-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @let data = timeline();
    <ul class="flex flex-wrap justify-center gap-2 mb-5" aria-label="Support statuses">
      @for (item of data.legend; track item.status) {
        <li class="hub-timeline-chip" [attr.data-status]="item.status">
          <span class="hub-timeline-swatch" aria-hidden="true"></span>
          {{ item.label }} <span class="text-muted">×{{ item.count }}</span>
        </li>
      }
    </ul>

    <div class="hub-timeline hub-pixel-frame">
      <div
        #scroll
        class="hub-timeline-scroll"
        tabindex="0"
        role="group"
        aria-label="Release timeline"
      >
        <div class="hub-timeline-canvas">
          <div class="hub-timeline-today" [style.left.%]="data.today.offset" aria-hidden="true">
            <span class="hub-timeline-today-label">YOU ARE HERE</span>
          </div>

          <ol class="hub-timeline-track" aria-label="Angular majors, oldest first">
            @for (major of data.majors; track major.major) {
              <li
                class="hub-timeline-major"
                [class.hub-timeline-major-below]="major.lane === 1"
                [attr.data-status]="major.status"
                [style.left.%]="major.offset"
              >
                <span class="hub-timeline-marker" aria-hidden="true"></span>
                <span class="hub-timeline-label">
                  @if (major.link) {
                    <a class="hub-timeline-version" [routerLink]="major.link">{{ major.label }}</a>
                  } @else {
                    <span class="hub-timeline-version">{{ major.label }}</span>
                  }
                  <span class="sr-only">
                    (Angular {{ major.major }}), released {{ major.released }},
                    {{ major.statusLabel }}</span
                  >
                  <time
                    class="hub-timeline-date"
                    [attr.datetime]="major.releasedIso"
                    aria-hidden="true"
                    >{{ major.releasedIso.slice(0, 7) }}</time
                  >
                </span>
              </li>
            }
          </ol>

          <div class="hub-timeline-years" aria-hidden="true">
            @for (year of data.years; track year.label) {
              <span [style.left.%]="year.offset">{{ year.label }}</span>
            }
          </div>

          <ul class="hub-timeline-windows" aria-label="Support windows of the supported majors">
            @for (row of data.supported; track row.major) {
              <li class="hub-timeline-window">
                <span
                  class="hub-timeline-window-label"
                  [style.right.%]="100 - row.segments[0]!.start"
                >
                  @if (row.link) {
                    <a [routerLink]="row.link" class="font-semibold hover:underline">{{
                      row.label
                    }}</a>
                  } @else {
                    <span class="font-semibold">{{ row.label }}</span>
                  }
                  <span class="text-muted"> · {{ row.summary }}</span>
                </span>
                @for (segment of row.segments; track segment.kind) {
                  <span
                    class="hub-timeline-segment"
                    [attr.data-kind]="segment.kind"
                    [class.hub-timeline-segment-narrow]="segment.width < 6"
                    [style.left.%]="segment.start"
                    [style.width.%]="segment.width"
                    [attr.title]="segment.label"
                    aria-hidden="true"
                    >{{ segment.kind === 'active' ? 'ACTIVE' : 'LTS' }}</span
                  >
                }
              </li>
            }
          </ul>
        </div>
      </div>
    </div>
    <p class="mt-3 text-center text-xs text-muted">
      Today: {{ data.today.label }}. Majors are typically supported for 24 months: 12 months active,
      then 12 months of long-term support (older majors had 18). Dates from
      <a class="underline" [href]="data.source" target="_blank" rel="noopener noreferrer"
        >angular.dev</a
      >.
    </p>
  `,
})
export class ReleaseTimelineView {
  readonly timeline = input.required<ReleaseTimeline>();

  private readonly scroll = viewChild.required<ElementRef<HTMLElement>>('scroll');

  constructor() {
    // On narrow screens, open on the present (the right end) rather than on Angular 2.
    afterNextRender(() => {
      const element = this.scroll().nativeElement;
      element.scrollLeft = element.scrollWidth;
    });
  }
}
