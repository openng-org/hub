import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A feature icon in a pixel-art frame: stepped corners and the logo gradient, with a hard offset
 * shadow (see `.hub-pixel-badge` in styles/pixel.css). Size it with Tailwind (`size-12`, …): the icon
 * scales with it. Decorative: the page title carries the meaning.
 */
@Component({
  selector: 'hub-pixel-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hub-pixel-badge',
    'aria-hidden': 'true',
  },
  template: `<span><i [class]="icon()"></i></span>`,
})
export class PixelBadge {
  /** A `pi pi-*` icon class. */
  readonly icon = input.required<string>();
}
