import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';

/** Placeholder rows (or a grid of cards) while a view loads; announced as busy to assistive technology. */
@Component({
  selector: 'hub-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonModule],
  host: { class: 'block', 'aria-busy': 'true', '[attr.aria-label]': 'label()' },
  template: `
    <div [class]="grid() ?? 'space-y-3'">
      @for (row of placeholders(); track row) {
        <p-skeleton [height]="height()" />
      }
    </div>
  `,
})
export class Loading {
  readonly rows = input(3);
  readonly height = input('3.5rem');
  readonly label = input('Loading');
  /** Grid classes (`grid gap-4 md:grid-cols-2`) when the view is a grid of cards; stacked rows otherwise. */
  readonly grid = input<string>();
  protected readonly placeholders = computed(() =>
    Array.from({ length: this.rows() }, (_, i) => i),
  );
}
