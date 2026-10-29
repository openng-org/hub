import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { ScoreBadge } from '../libraries.model';

/**
 * A health score as a pixel tile: the number in the brand font on the grade's colour (green from
 * 80, amber from 60, red below); a warning sign when a vulnerability zeroed the score; an empty
 * grey tile for a deprecated or archived library, which gets no score.
 */
@Component({
  selector: 'hub-health-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span
      [class]="
        'hub-health-badge hub-health-' +
        (badge().retired ? 'retired' : badge().grade) +
        (size() === 'lg' ? ' hub-health-badge-lg' : '')
      "
      role="img"
      [attr.aria-label]="label()"
      [title]="label()"
    >
      @if (badge().retired) {
        <!-- No score: the tile stays empty. -->
      } @else if (badge().blocked) {
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
      } @else {
        {{ badge().score }}
      }
    </span>
  `,
})
export class HealthBadge {
  readonly badge = input.required<ScoreBadge>();
  readonly size = input<'sm' | 'lg'>('sm');
  /** What the score is for, in the accessible name ("for Angular 22"). */
  readonly context = input('');

  protected readonly label = computed(() => {
    const { score, grade, blocked, retired } = this.badge();
    const what = this.context() ? ` ${this.context()}` : '';
    if (retired) {
      return `No health score${what}: ${retired === 'deprecated' ? 'deprecated on npm' : 'the repository is archived'}`;
    }
    return blocked
      ? `Health score${what}: 0, a vulnerability blocks this version`
      : `Health score${what}: ${score} out of 100, ${grade}`;
  });
}
