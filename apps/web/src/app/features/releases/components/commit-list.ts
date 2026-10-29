import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { CommitRow } from '../releases.model';
import { TextParts } from './text-parts';

/**
 * Commits as rows: type, package, subject (linking to the commit on GitHub), release and short sha.
 * With `linkReleases`, the release links to that release's commits in Release insights.
 */
@Component({
  selector: 'hub-commit-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TextParts],
  template: `
    <ul class="divide-y divide-surface border-y border-surface">
      @for (commit of commits(); track commit.sha) {
        <li
          class="hub-card-link flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 px-2 hover:bg-emphasis"
        >
          <span class="hub-commit-type" [attr.data-type]="commit.type">{{ commit.type }}</span>
          <span class="font-mono text-xs text-muted">{{ commit.package }}</span>
          <a
            class="hub-card-link-target text-sm min-w-0 flex-1 basis-64"
            [href]="commit.url"
            target="_blank"
            rel="noopener noreferrer"
            ><hub-text-parts [parts]="commit.description"
          /></a>
          @if (linkReleases()) {
            <a
              class="hub-card-link-above link font-mono text-xs"
              [routerLink]="['/releases', commit.version.split('.')[0], 'commits']"
              [queryParams]="{ version: commit.version }"
              [attr.aria-label]="'Commits of Angular ' + commit.version"
              >{{ commit.version }}</a
            >
          } @else {
            <span class="font-mono text-xs text-muted">{{ commit.version }}</span>
          }
          <span class="font-mono text-xs text-muted">{{ commit.shortSha }}</span>
        </li>
      }
    </ul>
  `,
})
export class CommitList {
  readonly commits = input.required<CommitRow[]>();
  readonly linkReleases = input(false);
}
