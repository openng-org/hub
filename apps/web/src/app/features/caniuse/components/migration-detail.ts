import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Tag } from '@openng/optimus-ui/tag';
import { Tooltip } from '@openng/optimus-ui/tooltip';

import type { MigrationDetail as MigrationDetailData } from '../caniuse.model';

/** One ng update migration: name, repository, introduced version, description and the example diff. */
@Component({
  selector: 'hub-migration-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Tag, Tooltip],
  host: { class: 'block space-y-6' },
  template: `
    <div class="space-y-2">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2 min-w-0">
          <h2 class="font-mono text-2xl font-semibold tracking-tight break-all">
            {{ migration().name }}
          </h2>
          <p-tag [value]="migration().repository" severity="secondary" />
          @if (migration().introduced; as introduced) {
            <p-tag [value]="introduced" severity="info" />
          }
        </div>
        @if (migration().sourceUrl; as url) {
          <a
            [href]="url"
            target="_blank"
            rel="noopener noreferrer"
            pButton
            [outlined]="true"
            severity="secondary"
            class="shrink-0"
            aria-label="Source on GitHub"
            pTooltip="Source on GitHub"
            tooltipPosition="left"
          >
            <i class="pi pi-github" aria-hidden="true"></i>
          </a>
        }
      </div>
      <p class="text-sm text-muted leading-relaxed max-w-3xl">
        {{ migration().description || '—' }}
      </p>
    </div>

    @if (migration().example?.explanation; as explanation) {
      <p class="text-sm leading-relaxed max-w-3xl">{{ explanation }}</p>
    }

    @if (!migration().example?.rows?.length) {
      <p class="text-sm text-muted">No example diff available for this migration yet.</p>
    } @else {
      <div class="rounded-border border border-surface overflow-x-auto">
        <table class="w-full text-xs font-mono">
          <thead>
            <tr class="bg-surface-50 dark:bg-surface-900 text-muted">
              <th class="text-left px-3 py-1.5 w-1/2 font-medium">Before</th>
              <th class="text-left px-3 py-1.5 w-1/2 font-medium border-l border-surface">After</th>
            </tr>
          </thead>
          <tbody>
            @for (row of migration().example?.rows; track $index) {
              <tr>
                <td
                  class="px-3 py-0.5 whitespace-pre align-top"
                  [class.bg-status-deprecated/15]="row.before?.removed"
                >
                  {{ row.before?.text ?? '' }}
                </td>
                <td
                  class="px-3 py-0.5 whitespace-pre align-top border-l border-surface"
                  [class.bg-status-stable/15]="row.after?.added"
                >
                  {{ row.after?.text ?? '' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (migration().example?.commitUrl; as commitUrl) {
        <a
          [href]="commitUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="link inline-flex items-center gap-2 text-sm"
        >
          <i class="pi pi-github" aria-hidden="true"></i>
          Example commit
        </a>
      }
    }
  `,
})
export class MigrationDetail {
  readonly migration = input.required<MigrationDetailData>();
}
