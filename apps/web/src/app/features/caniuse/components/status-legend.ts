import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import {
  STATUS_COLORS,
  STATUS_ICONS,
  type StatusLegendItem,
} from '../../../shared/utils/status.utils';

@Component({
  selector: 'hub-status-legend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="grid grid-cols-2 gap-2 md:gap-4" [class]="gridClass()">
      @for (item of items(); track item.type) {
        <div
          class="hub-pixel-corners flex items-start gap-3 p-2 md:p-3 bg-surface-0 dark:bg-surface-950"
        >
          <i
            class="text-xl leading-none mt-0.5"
            [class]="icons[item.type] + ' ' + colors[item.type].text"
            aria-hidden="true"
          ></i>
          <div class="min-w-0">
            <div class="text-sm font-medium">{{ item.label }}</div>
            <div class="text-muted text-xs leading-relaxed hidden md:block">
              {{ item.description }}
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class StatusLegend {
  readonly items = input.required<readonly StatusLegendItem[]>();
  readonly gridClass = input('lg:grid-cols-5');
  protected readonly icons = STATUS_ICONS;
  protected readonly colors = STATUS_COLORS;
}
