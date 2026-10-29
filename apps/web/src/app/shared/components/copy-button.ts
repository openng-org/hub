import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

/**
 * Copies `text` to the clipboard and confirms with a check mark for two seconds.
 * Optimus writes `autofocus="true"` on buttons and selects whose `autofocus` input is unset, and a
 * prerendered page would then give them the focus on load: every p-button passes
 * `buttonProps.autofocus: false`, every p-select `[autofocus]="false"`.
 */
@Component({
  selector: 'hub-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TooltipModule],
  template: `
    <p-button
      [buttonProps]="{ autofocus: false }"
      [icon]="copied() ? 'pi pi-check' : 'pi pi-copy'"
      [text]="true"
      [rounded]="true"
      size="small"
      [severity]="copied() ? 'success' : 'secondary'"
      [ariaLabel]="copied() ? 'Copied' : label()"
      [pTooltip]="copied() ? 'Copied!' : label()"
      tooltipPosition="top"
      (onClick)="copy($event)"
    />
  `,
})
export class CopyButton {
  readonly text = input.required<string>();
  readonly label = input('Copy to clipboard');

  protected readonly copied = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.timer) clearTimeout(this.timer);
    });
  }

  protected async copy(event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(this.text());
      this.copied.set(true);
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }
}
