import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A select option with how many items it holds, as a tag on the right: use it in a p-select's
 * `#item` template (`<hub-option-count [label]="option.label" [count]="option.count" />`).
 */
@Component({
  selector: 'hub-option-count',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex w-full min-w-0 items-center justify-between gap-3' },
  template: `
    <span class="truncate">{{ label() }}</span>
    @if (count() !== null && count() !== undefined) {
      <span class="hub-option-count">{{ count() }}</span>
    }
  `,
})
export class OptionCount {
  readonly label = input.required<string>();
  readonly count = input<number | null | undefined>();
}
