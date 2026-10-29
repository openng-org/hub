import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * A view that could not be loaded (the API did not answer, the network dropped): what failed and a
 * button to try again. Every page shows this instead of its data when its resource errors.
 */
@Component({
  selector: 'hub-load-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', role: 'alert' },
  template: `
    <div class="hub-pixel-box mx-auto max-w-xl text-center py-8">
      <p class="hub-page-title text-3xl mb-2">Game over?</p>
      <p class="text-muted text-sm">
        Could not load {{ what() }}. Check your connection, then try again.
      </p>
      <button type="button" class="hub-pixel-btn mt-5" (click)="retry.emit()">
        <span><i class="pi pi-refresh" aria-hidden="true"></i> Try again</span>
      </button>
    </div>
  `,
})
export class LoadError {
  /** What was being loaded: "the events", "this release". */
  readonly what = input('this page');
  readonly retry = output<void>();
}
