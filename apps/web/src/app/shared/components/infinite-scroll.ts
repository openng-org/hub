import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';

import type { PagedResource } from '../../core/utils/query-params.utils';
import { InView } from '../directives/in-view';
import { Loading } from './loading';

/**
 * Infinite scroll for a paged list: placed after the list, it fetches the next page as it comes
 * near the viewport, shows placeholders while it loads, and a retry button when a page fails.
 *
 * The sentinel is recreated after each page (keyed on `pagesLoaded`), so a fresh observer fires
 * again when it is still in view, as happens with short pages or a tall screen.
 */
@Component({
  selector: 'hub-infinite-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, InView, Loading],
  host: { class: 'block' },
  template: `
    @let paged = pages();
    @if (paged.hasMore()) {
      @if (paged.error()) {
        <div class="flex flex-col items-center gap-2 py-6">
          <span class="text-sm text-muted" role="alert"
            >More {{ what() }} could not be loaded.</span
          >
          <p-button
            [buttonProps]="{ autofocus: false }"
            label="Try again"
            icon="pi pi-refresh"
            [outlined]="true"
            size="small"
            [loading]="paged.loading()"
            (onClick)="paged.loadMore()"
          />
        </div>
      } @else {
        @for (page of [paged.pagesLoaded()]; track page) {
          <div class="h-px" aria-hidden="true" hubInView (hubInView)="paged.loadMore()"></div>
        }
        @if (paged.loading()) {
          <hub-loading
            class="pt-3"
            [rows]="2"
            [height]="height()"
            [label]="'Loading more ' + what()"
          />
        }
      }
    }
  `,
})
export class InfiniteScroll {
  readonly pages = input.required<PagedResource<unknown>>();
  /** What the list holds, for the loading label and the error: "commits", "events". */
  readonly what = input.required<string>();
  /** Height of a placeholder row, to match the list's rows. */
  readonly height = input('2.5rem');
}
