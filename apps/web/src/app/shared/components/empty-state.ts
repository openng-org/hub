import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * "Nothing here", for a list with no items or filters matching nothing: a pixel box with a title
 * in the brand font, the message, an optional hint, and anything projected (a link) under them.
 */
@Component({
  selector: 'hub-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="hub-pixel-box mx-auto max-w-xl text-center py-10">
      @if (icon()) {
        <i [class]="icon() + ' text-3xl text-muted mb-3'" aria-hidden="true"></i>
      }
      <p class="hub-page-title text-3xl mb-2">{{ title() }}</p>
      <p class="text-muted text-sm">{{ message() }}</p>
      @if (hint()) {
        <p class="text-xs text-muted mt-2">{{ hint() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly hint = input<string>();
  /** A `pi pi-*` class, e.g. `pi pi-search` when filters matched nothing. */
  readonly icon = input<string>();
}
