import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Tag } from '@openng/optimus-ui/tag';

import { apiUrl } from '../../../../../core/api/api.utils';
import type { ReleaseEslint } from '../../../releases.model';
import { latestValue } from '../../../../../core/utils/query-params.utils';
import { EmptyState } from '../../../../../shared/components/empty-state';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import { SectionHeader } from '../../../components/section-header';

/** /releases/:version/eslint — angular-eslint rules released for the major. */
@Component({
  selector: 'hub-eslint-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Tag, EmptyState, LoadError, Loading, SectionHeader],
  template: `
    @if (list.error()) {
      <hub-load-error what="the ESLint rules" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <hub-section-header
        title="ESLint rules"
        [count]="list.items.length"
        [description]="'angular-eslint rules released for Angular ' + list.major + '.'"
      />
      @if (list.items.length === 0) {
        <hub-empty-state
          title="No new rules"
          [message]="'angular-eslint released no new rule for Angular ' + list.major + '.'"
        />
      } @else {
        <ul class="grid gap-4 md:grid-cols-2">
          @for (rule of list.items; track rule.name) {
            <li
              class="hub-card-link rounded-border border border-surface p-4 min-w-0 hover:border-primary transition-colors"
            >
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <a
                  class="hub-card-link-target font-mono font-medium break-all"
                  [href]="rule.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ rule.name }}</a
                >
                <p-tag [value]="rule.typeLabel" severity="secondary" />
                <span class="ml-auto font-mono text-xs text-muted">v{{ rule.version }}</span>
              </div>
              <p class="text-sm text-muted">{{ rule.description }}</p>
            </li>
          }
        </ul>
      }
      <a routerLink="/caniuse/eslint" class="link text-sm inline-block mt-6"
        >Every angular-eslint rule →</a
      >
    } @else {
      <hub-loading height="6rem" [rows]="2" label="Loading ESLint rules" />
    }
  `,
})
export default class EslintSection {
  readonly version = input.required<string>();

  protected readonly list = httpResource<ReleaseEslint>(() =>
    apiUrl(`releases/${Number(this.version())}/eslint`),
  );
  protected readonly data = latestValue(this.list);
}
