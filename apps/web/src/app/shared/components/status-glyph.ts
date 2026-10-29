import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { StatusBadge } from '../../features/releases/releases.model';
import { STATUS_COLORS, STATUS_ICONS, STATUS_TITLES } from '../utils/status.utils';

/**
 * A status as the Can I Use matrix draws it: the icon alone when it was reached in a major ("22"),
 * the icon followed by the version when it was a minor ("21.2"). The title and accessible name
 * spell it out ("Stable in 22").
 */
@Component({
  selector: 'hub-status-glyph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    @if (status(); as s) {
      @if (minor()) {
        <span
          class="hub-chip"
          [class]="color()"
          role="img"
          [attr.aria-label]="label()"
          [title]="label()"
        >
          <i [class]="icon()" aria-hidden="true"></i
          ><span class="hub-chip-version text-color">{{ s.version }}</span>
        </span>
      } @else {
        <i
          class="hub-glyph"
          [class]="icon() + ' ' + color()"
          role="img"
          [attr.aria-label]="label()"
          [title]="label()"
        ></i>
      }
    } @else {
      <span class="text-xs text-muted" aria-label="Not available">—</span>
    }
  `,
})
export class StatusGlyph {
  readonly status = input.required<StatusBadge | null>();

  protected readonly minor = computed(() => (this.status()?.version ?? '').includes('.'));
  protected readonly icon = computed(() => {
    const s = this.status();
    return s ? STATUS_ICONS[s.status] : '';
  });
  protected readonly color = computed(() => {
    const s = this.status();
    return s ? STATUS_COLORS[s.status].text : '';
  });
  protected readonly label = computed(() => {
    const s = this.status();
    if (!s) return '';
    return s.version ? `${STATUS_TITLES[s.status]} in ${s.version}` : STATUS_TITLES[s.status];
  });
}
