import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The title of a release section, its one-line description, and room for filters (projected). */
@Component({
  selector: 'hub-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block mb-6' },
  template: `
    <h2 class="hub-page-title text-4xl flex items-baseline gap-3">
      {{ title() }}
      @if (count() !== null) {
        <span class="text-base text-muted font-sans">{{ count() }}</span>
      }
    </h2>
    <p class="text-muted mt-1">{{ description() }}</p>
    <ng-content />
  `,
})
export class SectionHeader {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly count = input<number | null>(null);
}
