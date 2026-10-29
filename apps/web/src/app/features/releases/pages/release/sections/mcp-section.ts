import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Tag } from '@openng/optimus-ui/tag';

import { apiUrl } from '../../../../../core/api/api.utils';
import type { ReleaseMcp } from '../../../releases.model';
import { latestValue } from '../../../../../core/utils/query-params.utils';
import { EmptyState } from '../../../../../shared/components/empty-state';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import { StatusPill } from '../../../../../shared/components/status-pill';
import { SectionHeader } from '../../../components/section-header';

/** /releases/:version/mcp — tools and resources the Angular MCP server gained in the major. */
@Component({
  selector: 'hub-mcp-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Tag, EmptyState, LoadError, Loading, SectionHeader, StatusPill],
  template: `
    @if (list.error()) {
      <hub-load-error what="the MCP server features" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <hub-section-header
        title="MCP server"
        [count]="list.items.length"
        [description]="
          'Tools and resources the Angular MCP server gained in Angular ' + list.major + '.'
        "
      />
      @if (list.items.length === 0) {
        <hub-empty-state
          title="Nothing new"
          [message]="
            list.unavailableNote ??
            'The MCP server gained no tool or resource in Angular ' + list.major + '.'
          "
        />
      } @else {
        <ul class="grid gap-4 md:grid-cols-2">
          @for (item of list.items; track item.id) {
            <li class="rounded-border border border-surface p-4 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="font-mono font-medium">{{ item.name }}</span>
                <p-tag [value]="item.typeLabel" severity="secondary" />
                <hub-status-pill [status]="item.status" class="ml-auto" />
              </div>
              <p class="text-sm text-muted">{{ item.description }}</p>
            </li>
          }
        </ul>
      }
      <a routerLink="/caniuse/mcp" class="link text-sm inline-block mt-6"
        >The MCP server in every version →</a
      >
    } @else {
      <hub-loading height="6rem" [rows]="2" label="Loading MCP server features" />
    }
  `,
})
export default class McpSection {
  readonly version = input.required<string>();

  protected readonly list = httpResource<ReleaseMcp>(() =>
    apiUrl(`releases/${Number(this.version())}/mcp`),
  );
  protected readonly data = latestValue(this.list);
}
