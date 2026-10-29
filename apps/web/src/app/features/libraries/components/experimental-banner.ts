import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Says the health score is experimental: its rules are still being tuned, so a score is a hint to
 * dig further, not a verdict. Shown on the list and on every library page.
 */
@Component({
  selector: 'hub-experimental-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <aside
      class="hub-pixel-box flex gap-3 items-start text-sm border-l-4 border-status-experimental"
      aria-label="Experimental feature"
    >
      <i class="pi pi-flask text-status-experimental text-lg mt-0.5" aria-hidden="true"></i>
      <p>
        <strong>Experimental.</strong> The health score is new and its rules are still being tuned:
        read it as a hint to dig further, not as a verdict on a library.
        <a class="link underline" routerLink="/libraries/score">See how it is computed</a>, and tell
        us what looks off on
        <a
          class="link underline"
          href="https://github.com/openng-org/hub/issues"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >.
      </p>
    </aside>
  `,
})
export class ExperimentalBanner {}
