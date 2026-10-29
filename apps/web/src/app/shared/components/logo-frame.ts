import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

/**
 * A logo in a pixel frame; falls back to the name's initial on the brand gradient when there is no
 * logo or it fails to load. Size it with Tailwind (`size-14`, …).
 */
@Component({
  selector: 'hub-logo-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hub-logo-frame',
    '[class.hub-logo-empty]': '!showImage()',
  },
  template: `
    @if (showImage()) {
      <img [src]="src()" alt="" loading="lazy" decoding="async" (error)="failed.set(true)" />
    } @else {
      <span class="hub-logo-fallback" aria-hidden="true">{{ initial() }}</span>
    }
  `,
})
export class LogoFrame {
  readonly src = input<string | null>(null);
  /** Used for the fallback initial. */
  readonly name = input.required<string>();

  /** Reset when another logo is given. */
  protected readonly failed = linkedSignal<string | null, boolean>({
    source: this.src,
    computation: () => false,
  });
  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly initial = computed(() => this.name().trim().charAt(0).toUpperCase());
}
