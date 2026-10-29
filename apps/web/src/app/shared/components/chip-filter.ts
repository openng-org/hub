import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface ChipOption {
  value: string;
  label: string;
  count?: number;
  icon?: string;
  /** Listed but not selectable (nothing behind it). */
  disabled?: boolean;
}

/**
 * A row of toggle chips (one value at a time). `''` is the "all" option when listed. `value` is a
 * model: bind it two-way, or one-way with `(valueChange)`.
 */
@Component({
  selector: 'hub-chip-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hub-chips', role: 'group', '[attr.aria-label]': 'label()' },
  template: `
    @for (option of options(); track option.value) {
      <button
        type="button"
        [attr.aria-pressed]="option.value === value()"
        [disabled]="option.disabled ?? false"
        (click)="value.set(option.value)"
      >
        @if (option.icon) {
          <i [class]="option.icon" aria-hidden="true"></i>
        }
        {{ option.label }}
        @if (option.count !== undefined) {
          <span class="hub-chip-count">{{ option.count }}</span>
        }
      </button>
    }
  `,
})
export class ChipFilter {
  readonly options = input.required<ChipOption[]>();
  readonly value = model('');
  /** Accessible name of the group. */
  readonly label = input.required<string>();
}
