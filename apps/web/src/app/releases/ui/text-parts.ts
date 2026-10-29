import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { TextPart } from '../data/api';

/** Text with its `inline code` runs, as the API splits them. */
@Component({
  selector: 'hub-text-parts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (part of parts(); track $index) {
    @if (part.code) {
      <code class="hub-inline-code">{{ part.text }}</code>
    } @else {
      {{ part.text }}
    }
  }`,
})
export class TextParts {
  readonly parts = input.required<TextPart[]>();
}
