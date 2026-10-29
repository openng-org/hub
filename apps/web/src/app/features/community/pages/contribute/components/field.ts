import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * One field of the contribution form: the label (pointing at the control when `inputId` is given),
 * the projected control and hints, and the field's error once the form has been checked.
 */
@Component({
  selector: 'hub-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hub-field' },
  template: `
    @if (inputId(); as id) {
      <label [for]="id">
        {{ label() }}
        @if (optional(); as note) {
          <span class="hub-optional">{{ note }}</span>
        }
      </label>
    } @else {
      <span class="hub-label">
        {{ label() }}
        @if (optional(); as note) {
          <span class="hub-optional">{{ note }}</span>
        }
      </span>
    }
    <ng-content />
    @if (error(); as message) {
      <p class="hub-error" role="alert">{{ message }}</p>
    }
  `,
})
export class Field {
  readonly label = input.required<string>();
  /** The control's id; a group of chips has none, and gets a plain caption. */
  readonly inputId = input<string>();
  /** "optional", "if several": shown muted after the label. */
  readonly optional = input<string>();
  readonly error = input<string | undefined>();
}
