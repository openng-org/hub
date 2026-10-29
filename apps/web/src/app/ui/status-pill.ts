import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { STATUS_COLORS, STATUS_ICONS, STATUS_TITLES } from './status-style';
import type { StatusBadge } from '../releases/data/api';

/** A status with its icon and colour, and the version it was reached in when given. */
@Component({
  selector: 'hub-status-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    @if (status(); as s) {
      <span
        class="inline-flex items-center gap-1.5 rounded-border border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
        [class]="classes()"
      >
        <i [class]="icon() + ' ' + iconColor()" aria-hidden="true"></i>
        {{ title() }}
        @if (s.version) {
          <span class="font-normal">{{ s.version }}</span>
        }
      </span>
    } @else {
      <span class="text-xs text-muted">—</span>
    }
  `,
})
export class StatusPill {
  readonly status = input.required<StatusBadge | null>();

  protected readonly title = computed(() => {
    const s = this.status();
    return s ? STATUS_TITLES[s.status] : '';
  });
  protected readonly icon = computed(() => {
    const s = this.status();
    return s ? STATUS_ICONS[s.status] : '';
  });
  protected readonly iconColor = computed(() => {
    const s = this.status();
    return s ? STATUS_COLORS[s.status].text : '';
  });
  protected readonly classes = computed(() => {
    const s = this.status();
    if (!s) return '';
    // Text stays in the body colour (tinted text fails 4.5:1 on the tinted background); the icon
    // carries the status colour.
    const palette = STATUS_COLORS[s.status];
    return `text-color ${palette.bg} ${palette.border}`;
  });
}
