import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Select } from '@openng/optimus-ui/select';
import { Tag } from '@openng/optimus-ui/tag';

import { apiUrl } from '../../../../../core/api/api.utils';
import type { ReleaseGuides } from '../../../releases.model';
import { injectQueryParams, latestValue } from '../../../../../core/utils/query-params.utils';
import { CopyButton } from '../../../../../shared/components/copy-button';
import { EmptyState } from '../../../../../shared/components/empty-state';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import type { TagSeverity } from '../../../../../shared/utils/status.utils';
import type { GuideCriticality, GuideQuery } from '../../../releases.model';
import { SectionHeader } from '../../../components/section-header';
import { TextParts } from '../../../components/text-parts';

const CRITICALITY_SEVERITY: Record<GuideCriticality, TagSeverity> = {
  critical: 'danger',
  high: 'warn',
  medium: 'info',
  low: 'secondary',
};

/**
 * /releases/:version/guide — per minor release, what to check when updating, most critical first,
 * with steps, commands and before/after code. ?criticality=&difficulty=&impact= filter.
 */
@Component({
  selector: 'hub-guide-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    Select,
    Tag,
    CopyButton,
    EmptyState,
    LoadError,
    Loading,
    SectionHeader,
    TextParts,
  ],
  template: `
    @if (list.error()) {
      <hub-load-error what="the migration guide" (retry)="list.reload()" />
    } @else if (data(); as data) {
      <hub-section-header
        title="Migration guide"
        [description]="
          'What changes when moving to each Angular ' +
          data.major +
          '.x release and how to migrate, rated by criticality, difficulty and impact.'
        "
      >
        @if (data.guides.length > 0) {
          <!-- One set of filters for every minor below; they live in the URL. -->
          <div class="filter-bar mt-4 flex flex-wrap items-center gap-3">
            <div class="hub-chips" role="group" aria-label="Criticality">
              @for (level of data.criticalities; track level.value) {
                <button
                  type="button"
                  [attr.aria-pressed]="criticality() === level.value"
                  [disabled]="level.count === 0"
                  (click)="
                    params.set('criticality', criticality() === level.value ? '' : level.value)
                  "
                >
                  <span
                    class="hub-criticality-dot"
                    [attr.data-level]="level.value"
                    aria-hidden="true"
                  ></span>
                  {{ level.label }}
                  <span class="hub-chip-count">{{ level.count }}</span>
                </button>
              }
            </div>
            <p-select
              [autofocus]="false"
              [options]="data.difficulties"
              optionLabel="label"
              optionValue="value"
              [ngModel]="difficulty()"
              (onChange)="params.set('difficulty', $event.value ?? '')"
              ariaLabel="Difficulty"
              placeholder="Any difficulty"
              styleClass="w-44"
            />
            <p-select
              [autofocus]="false"
              [options]="data.impacts"
              optionLabel="label"
              optionValue="value"
              [ngModel]="impact()"
              (onChange)="params.set('impact', $event.value ?? '')"
              ariaLabel="Impact"
              placeholder="Any impact"
              styleClass="w-44"
            />
          </div>
        }
      </hub-section-header>

      @if (data.guides.length === 0) {
        <hub-empty-state
          title="No guide yet"
          [message]="'No migration guide has been written for Angular ' + data.major + ' yet.'"
        />
      }

      @for (guide of data.guides; track guide.version) {
        <section class="mb-12" [attr.aria-labelledby]="'guide-' + guide.version">
          <h3 [id]="'guide-' + guide.version" class="hub-page-title text-3xl mb-3">
            {{ guide.from }} → {{ guide.version }}
          </h3>
          <div class="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <p-tag [value]="guide.released" severity="secondary" />
            <p-tag
              [value]="guide.hasBreaking ? 'Contains breaking changes' : 'No breaking changes'"
              [severity]="guide.hasBreaking ? 'danger' : 'success'"
            />
            <span class="text-muted">{{ guide.changes.length }} / {{ guide.total }} changes</span>
          </div>
          <p class="text-muted leading-relaxed max-w-3xl mb-5">{{ guide.summary }}</p>

          <div class="hub-pixel-box mb-6 max-w-3xl">
            <p class="text-sm font-semibold mb-2 flex items-center gap-2">
              <i class="pi pi-desktop" aria-hidden="true"></i> Step 1 — update the packages
            </p>
            <div class="hub-command">
              <code>{{ guide.updateCommand }}</code>
              <hub-copy-button [text]="guide.updateCommand" label="Copy the command" />
            </div>
            <p class="text-xs text-muted mt-2">
              Then go through the changes below, most critical first.
            </p>
          </div>

          @if (guide.changes.length === 0) {
            <p class="text-sm text-muted py-6">No change matches these filters.</p>
          }

          <div class="space-y-5">
            @for (change of guide.changes; track change.id) {
              <article
                [id]="change.id"
                class="rounded-border border border-surface p-5 scroll-mt-24 min-w-0"
              >
                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <p-tag
                    [value]="change.criticalityLabel"
                    [severity]="severity[change.criticality]"
                  />
                  <p-tag
                    [value]="change.impactLabel"
                    [icon]="change.impactIcon"
                    severity="secondary"
                  />
                  <p-tag
                    [value]="change.kindLabel"
                    [severity]="change.breaking ? 'danger' : 'secondary'"
                  />
                  <span
                    class="inline-flex items-center gap-1.5 text-xs text-muted"
                    [title]="'Difficulty: ' + change.difficultyLabel"
                  >
                    <span
                      class="hub-meter"
                      [attr.data-level]="change.difficultyLevel"
                      aria-hidden="true"
                      ><span></span><span></span><span></span><span></span
                    ></span>
                    {{ change.difficultyLabel }}
                  </span>
                  <span class="ml-auto font-mono text-xs text-muted"
                    >since {{ change.introducedIn }}</span
                  >
                </div>
                <h4 class="text-lg font-semibold leading-snug mb-2">{{ change.title }}</h4>
                <p class="text-sm text-muted leading-relaxed mb-3">
                  <hub-text-parts [parts]="change.summary" />
                </p>
                <div class="flex flex-wrap gap-1.5 mb-4">
                  @for (pkg of change.packages; track pkg) {
                    <span
                      class="rounded-border border border-surface px-1.5 py-0.5 font-mono text-[11px] text-muted"
                      >{{ pkg }}</span
                    >
                  }
                </div>
                <p class="text-sm rounded-border bg-emphasis p-3 mb-4 flex gap-2">
                  <i class="pi pi-users text-muted mt-0.5" aria-hidden="true"></i>
                  <span
                    ><strong class="font-medium">Who is affected:</strong>
                    {{ change.affects }}</span
                  >
                </p>
                <h5 class="text-sm font-semibold mb-2">How to migrate</h5>
                <ol class="list-decimal pl-5 space-y-1.5 text-sm leading-relaxed mb-4">
                  @for (step of change.steps; track $index) {
                    <li><hub-text-parts [parts]="step" /></li>
                  }
                </ol>
                @if (change.command; as command) {
                  <div class="hub-command mb-4">
                    <code>{{ command }}</code>
                    <hub-copy-button [text]="command" label="Copy the command" />
                  </div>
                }
                @if (change.before || change.after) {
                  <div
                    class="grid gap-3 min-w-0 mb-4"
                    [class.xl:grid-cols-2]="change.before && change.after"
                  >
                    @if (change.before; as before) {
                      <div class="min-w-0">
                        <p class="text-xs font-medium text-muted mb-1">Before</p>
                        <pre class="hub-code" tabindex="0"><code>{{ before }}</code></pre>
                      </div>
                    }
                    @if (change.after; as after) {
                      <div class="min-w-0">
                        <p class="text-xs font-medium text-muted mb-1">
                          {{ change.before ? 'After' : 'Example' }}
                        </p>
                        <pre class="hub-code" tabindex="0"><code>{{ after }}</code></pre>
                      </div>
                    }
                  </div>
                }
                @if (change.links.length > 0) {
                  <div class="flex flex-wrap gap-x-4 gap-y-1 border-t border-surface pt-3">
                    @for (link of change.links; track link.url) {
                      <a
                        class="link text-xs inline-flex items-center gap-1"
                        [href]="link.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ link.label }}
                        <i class="pi pi-external-link text-[0.6rem]" aria-hidden="true"></i
                      ></a>
                    }
                  </div>
                }
              </article>
            }
          </div>
        </section>
      }
    } @else {
      <hub-loading height="12rem" [rows]="1" label="Loading the migration guide" />
    }
  `,
})
export default class GuideSection {
  /** Route parameter. */
  readonly version = input.required<string>();

  protected readonly params = injectQueryParams();
  protected readonly criticality = this.params.get('criticality');
  protected readonly difficulty = this.params.get('difficulty');
  protected readonly impact = this.params.get('impact');
  protected readonly severity = CRITICALITY_SEVERITY;

  protected readonly list = httpResource<ReleaseGuides>(() =>
    apiUrl(`releases/${Number(this.version())}/guide`, {
      criticality: this.criticality(),
      difficulty: this.difficulty(),
      impact: this.impact(),
    } satisfies GuideQuery),
  );
  protected readonly data = latestValue(this.list);
}
