import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Emits each time the host enters the viewport (an infinite-scroll sentinel).
 * Browser-only by construction: the observer is created after the first render.
 */
@Directive({ selector: '[hubInView]' })
export class InView {
  /** Margin around the viewport that counts as "in view" (IntersectionObserver rootMargin). */
  readonly rootMargin = input('400px 0px');
  readonly hubInView = output<void>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.hubInView.emit();
        },
        { rootMargin: this.rootMargin() },
      );
      observer.observe(element.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
