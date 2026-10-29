import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TagModule } from '@openng/optimus-ui/tag';
import { ButtonModule } from '@openng/optimus-ui/button';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';

import type { FeatureDetail, FeatureRow } from '../data/api';
import { CopyButton } from '../../ui/copy-button';
import { STATUS_SEVERITY } from '../../ui/status-style';

/**
 * Everything known about a feature: description, notes, migration script, links, version history.
 * Shared by the drawer (which may show the list row while the detail loads) and the feature page.
 */
@Component({
  selector: 'hub-feature-detail-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TagModule, ButtonModule, SkeletonModule, CopyButton],
  host: { class: 'block space-y-6' },
  template: `
    @if (feature().description; as description) {
      <p class="text-sm text-muted leading-relaxed">{{ description }}</p>
    }

    @if (detail(); as detail) {
      @if (detail.notes; as notes) {
        <section>
          <h3 class="text-sm font-semibold mb-2">Notes</h3>
          <div class="hub-note">{{ notes }}</div>
        </section>
      }

      @if (detail.migrationNotes; as migrationNotes) {
        <section>
          <h3 class="text-sm font-semibold mb-2">Migration Notes</h3>
          <div class="hub-note">{{ migrationNotes }}</div>
        </section>
      }

      @if (detail.migrationScript; as script) {
        <section>
          <h3 class="text-sm font-semibold mb-2">Migration Script</h3>
          <div class="flex items-center gap-2">
            <code
              class="block flex-1 min-w-0 text-sm bg-surface-100 dark:bg-surface-800 p-3 rounded-border font-mono break-all"
            >
              {{ script.command }}
            </code>
            <hub-copy-button [text]="script.command" label="Copy migration script" />
          </div>
          <p-button
            label="View migration"
            icon="pi pi-external-link"
            [link]="true"
            size="small"
            styleClass="mt-2 px-0!"
            (onClick)="navigateToMigration.emit(script.search)"
          />
        </section>
      }

      @if (detail.links.length > 0 || detail.replacement) {
        <section>
          <h3 class="text-sm font-semibold mb-3">Links</h3>
          <ul class="space-y-2">
            @for (link of detail.links; track link.url + link.label) {
              <li>
                <a
                  [href]="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link inline-flex items-center gap-2 text-sm"
                >
                  <i [class]="link.icon" aria-hidden="true"></i>
                  {{ link.label }}
                </a>
              </li>
            }
            @if (detail.replacement; as replacement) {
              <li>
                @if (replacement.id; as id) {
                  <button
                    type="button"
                    class="link inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
                    (click)="navigateToFeature.emit(id)"
                  >
                    <i class="pi pi-arrow-right" aria-hidden="true"></i>
                    View replacement: {{ replacement.name }}
                  </button>
                } @else {
                  <span class="text-sm text-muted">
                    Replaced by: <span class="font-medium text-color">{{ replacement.name }}</span>
                  </span>
                }
              </li>
            }
          </ul>
        </section>
      }

      @if (detail.history.length > 0) {
        <section>
          <h3 class="text-sm font-semibold mb-3">Version History</h3>
          <div class="space-y-3">
            @for (entry of detail.history; track entry.version) {
              <div class="rounded-border border border-surface p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-semibold">v{{ entry.version }}</span>
                  <p-tag [value]="entry.status" [severity]="severity[entry.status]" />
                </div>
                @if (entry.notes; as notes) {
                  <div class="hub-note">{{ notes }}</div>
                }
              </div>
            }
          </div>
        </section>
      }
    } @else {
      <div class="space-y-3" aria-busy="true" aria-label="Loading details">
        <p-skeleton height="1rem" width="40%" />
        <p-skeleton height="4rem" />
        <p-skeleton height="1rem" width="30%" />
      </div>
    }
  `,
})
export class FeatureDetailContent {
  /** The full detail, or the list row while the detail loads. */
  readonly feature = input.required<FeatureRow | FeatureDetail>();
  /** Id of the feature to open next (the replacement). */
  readonly navigateToFeature = output<string>();
  /** Search term for the NG Update tab. */
  readonly navigateToMigration = output<string>();

  protected readonly severity = STATUS_SEVERITY;
  protected readonly detail = computed(() => {
    const feature = this.feature();
    return 'history' in feature ? feature : null;
  });
}
