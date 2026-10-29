import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PixelBadge } from '../../shared/components/pixel-badge';

/**
 * The header of a hub page: a pixel badge with the page's icon, a small gradient eyebrow over a
 * title in the brand font, and the description in a pixel box. Anything projected (stats, links)
 * goes under the description; an element marked `hubHeaderActions` goes to the right of it all (under
 * it on narrow screens).
 */
@Component({
  selector: 'hub-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PixelBadge],
  host: { class: 'block mb-8' },
  template: `
    <header class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
      <div class="min-w-0">
        <div class="flex items-center gap-4 md:gap-5">
          <hub-pixel-badge [icon]="icon()" class="size-14 md:size-[72px]" />
          <!-- The pixel font sits low in its em box: tight line heights keep the eyebrow close. -->
          <h1 class="hub-page-title text-5xl md:text-6xl min-w-0">
            <span
              class="hub-wordmark block text-lg md:text-xl leading-none tracking-[0.2em] uppercase"
              >{{ eyebrow() }}</span
            >
            <span class="block leading-[0.8]">{{ title() }}</span>
          </h1>
        </div>
        <p class="hub-pixel-box mt-5 max-w-2xl text-muted">{{ description() }}</p>
        <ng-content />
      </div>
      <ng-content select="[hubHeaderActions]" />
    </header>
  `,
})
export class PageHeader {
  /** `pi pi-*` icon class of the badge. */
  readonly icon = input.required<string>();
  readonly eyebrow = input('Angular');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
